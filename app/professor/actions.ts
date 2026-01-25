"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- FUNÇÃO DE EXCLUIR LIÇÃO ---
export async function excluirLicao(id: string) {
    // 1. Apaga o histórico de quem leu essa lição
    try {
        await prisma.lessonHistory.deleteMany({
            where: { lessonId: id }
        });
    } catch (e) {
        // Ignora se não existir
    }

    // 2. Apaga os resultados de Quiz
    const perguntas = await prisma.question.findMany({
        where: { lessonId: id },
        select: { id: true }
    });

    const idsPerguntas = perguntas.map(p => p.id);

    if (idsPerguntas.length > 0) {
        await prisma.quizResult.deleteMany({
            where: { questionId: { in: idsPerguntas } }
        });
    }

    // 3. Apaga as perguntas
    await prisma.question.deleteMany({
        where: { lessonId: id }
    });

    // 4. Apaga a lição
    await prisma.lesson.delete({
        where: { id: id }
    });

    revalidatePath("/professor");
    revalidatePath("/aluno");
}

// --- FUNÇÃO DE REFORMULAR TRIBOS ---
export async function reformularTribos() {
    // 1. Lista das tribos que VÃO FICAR
    const tribosOficiais = [
        { name: "Tribo de Judá 🦁" },
        { name: "Tribo de Levi 🛡️" }
    ];

    // 2. Garante que Judá e Levi existem
    for (const t of tribosOficiais) {
        const existe = await prisma.squad.findFirst({ where: { name: t.name } });
        if (!existe) {
            await prisma.squad.create({ data: { name: t.name, totalXp: 0 } });
        }
    }

    // 3. Busca todas as tribos
    const todasTribos = await prisma.squad.findMany();

    // 4. Filtra as tribos para excluir
    const tribosParaExcluir = todasTribos.filter(t =>
        t.name !== "Tribo de Judá 🦁" &&
        t.name !== "Tribo de Levi 🛡️"
    );

    // 5. Remove os alunos das tribos que vão sumir
    for (const tribo of tribosParaExcluir) {
        const alunosOrfaos = await prisma.user.findMany({ where: { squadId: tribo.id } });

        if (alunosOrfaos.length > 0) {
            await prisma.user.updateMany({
                where: { squadId: tribo.id },
                data: { squadId: null }
            });
        }

        await prisma.squad.delete({ where: { id: tribo.id } });
    }

    revalidatePath("/aluno/ranking");
    revalidatePath("/aluno/escolher-tribo");
    return { success: true, message: "Tribos reformuladas!" };
}

// --- FUNÇÃO SUPREMA: SINCRONIZAR TUDO (XP e STREAK) ---
// Essa função conserta o passado, recalcula o XP correto (50) e arruma os dias seguidos.
export async function sincronizarTudo() {

    // 1. Busca todos os alunos e seus históricos
    const alunos = await prisma.user.findMany({
        include: { attendances: { orderBy: { date: 'asc' } } }
    });

    let totalCorrigidos = 0;

    for (const aluno of alunos) {

        // A. RECALCULA XP DO ZERO
        // Regra: EBD = 50 XP, Outros = 20 XP
        let xpReal = 0;
        aluno.attendances.forEach(p => {
            if (p.type === 'EBD') xpReal += 50;
            else xpReal += 20;
        });

        // B. RECALCULA DIAS SEGUIDOS (STREAK) DO ZERO
        let streakReal = 0;
        if (aluno.attendances.length > 0) {
            streakReal = 1; // Começa com 1 se tiver pelo menos uma presença

            // Percorre do último para trás
            for (let i = aluno.attendances.length - 1; i > 0; i--) {
                const dataAtual = new Date(aluno.attendances[i].date);
                const dataAnterior = new Date(aluno.attendances[i-1].date);

                // Zera horas para comparar apenas dias
                dataAtual.setHours(0,0,0,0);
                dataAnterior.setHours(0,0,0,0);

                // Diferença em dias
                const diffTempo = dataAtual.getTime() - dataAnterior.getTime();
                const diffDias = diffTempo / (1000 * 3600 * 24);

                if (diffDias === 1) {
                    streakReal++; // É consecutivo!
                } else if (diffDias === 0) {
                    // Mesmo dia, ignora e continua
                } else {
                    break; // Quebrou a sequência
                }
            }

            // Validação final: Se a última presença foi antes de ontem, o streak morreu.
            const ultimaData = new Date(aluno.attendances[aluno.attendances.length - 1].date);
            ultimaData.setHours(0,0,0,0);
            const hoje = new Date();
            hoje.setHours(0,0,0,0);

            const diffUltima = (hoje.getTime() - ultimaData.getTime()) / (1000 * 3600 * 24);

            if (diffUltima > 1) {
                streakReal = 0;
            }
        }

        // C. SALVA NO BANCO (Só se tiver diferença)
        if (aluno.xp !== xpReal || aluno.currentStreak !== streakReal) {
            await prisma.user.update({
                where: { id: aluno.id },
                data: {
                    xp: xpReal,
                    currentStreak: streakReal
                }
            });
            totalCorrigidos++;
        }
    }

    revalidatePath("/professor");
    revalidatePath("/aluno");

    return { success: true, count: totalCorrigidos };
}