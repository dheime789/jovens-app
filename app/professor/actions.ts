"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- FUNÇÃO DE EXCLUIR LIÇÃO (CORRIGIDA PARA LIMPAR CACHE) ---
export async function excluirLicao(id: string) {
    try { await prisma.lessonHistory.deleteMany({ where: { lessonId: id } }); } catch (e) {}

    const perguntas = await prisma.question.findMany({ where: { lessonId: id }, select: { id: true } });
    const idsPerguntas = perguntas.map(p => p.id);

    if (idsPerguntas.length > 0) {
        await prisma.quizResult.deleteMany({ where: { questionId: { in: idsPerguntas } } });
    }

    await prisma.question.deleteMany({ where: { lessonId: id } });

    // Apaga a lição
    await prisma.lesson.delete({ where: { id: id } });

    // --- AQUI ESTÁ A MÁGICA ---
    // Avisa todas as telas que a lista mudou
    revalidatePath("/professor");
    revalidatePath("/aluno");
    revalidatePath("/aluno/licoes"); // <--- ESSA LINHA RESOLVE O SEU PROBLEMA
}

// --- FUNÇÃO DE EXCLUIR ALUNO ---
export async function excluirAluno(id: string) {
    const aluno = await prisma.user.findUnique({ where: { id } });
    if (aluno && aluno.squadId && aluno.xp > 0) {
        try {
            await prisma.squad.update({
                where: { id: aluno.squadId },
                data: { totalXp: { decrement: aluno.xp } }
            });
        } catch (e) {}
    }
    await prisma.quizResult.deleteMany({ where: { userId: id } });
    await prisma.attendance.deleteMany({ where: { userId: id } });
    await prisma.notification.deleteMany({ where: { userId: id } });
    try { await prisma.lessonHistory.deleteMany({ where: { userId: id } }); } catch(e) {}
    await prisma.user.delete({ where: { id } });

    revalidatePath("/professor");
    revalidatePath("/aluno/ranking");
}

// --- FUNÇÃO DE REFORMULAR TRIBOS ---
export async function reformularTribos() {
    const tribosOficiais = [{ name: "Tribo de Judá 🦁" }, { name: "Tribo de Levi 🛡️" }];
    for (const t of tribosOficiais) {
        const existe = await prisma.squad.findFirst({ where: { name: t.name } });
        if (!existe) { await prisma.squad.create({ data: { name: t.name, totalXp: 0 } }); }
    }
    const todasTribos = await prisma.squad.findMany();
    const tribosParaExcluir = todasTribos.filter(t => t.name !== "Tribo de Judá 🦁" && t.name !== "Tribo de Levi 🛡️");
    for (const tribo of tribosParaExcluir) {
        const alunosOrfaos = await prisma.user.findMany({ where: { squadId: tribo.id } });
        if (alunosOrfaos.length > 0) {
            await prisma.user.updateMany({ where: { squadId: tribo.id }, data: { squadId: null } });
        }
        await prisma.squad.delete({ where: { id: tribo.id } });
    }
    revalidatePath("/aluno/ranking");
    revalidatePath("/aluno/escolher-tribo");
    return { success: true, message: "Tribos reformuladas!" };
}

// --- FUNÇÃO: ZERAR PLACAR DAS TRIBOS ---
export async function zerarPlacarTribos() {
    await prisma.squad.updateMany({ data: { totalXp: 0 } });
    revalidatePath("/aluno/ranking");
    return { success: true };
}

// --- FUNÇÃO: SINCRONIZAR TUDO ---
export async function sincronizarTudo() {
    const alunos = await prisma.user.findMany({ include: { attendances: { orderBy: { date: 'asc' } } } });
    let totalCorrigidos = 0;
    for (const aluno of alunos) {
        let xpReal = 0;
        aluno.attendances.forEach(p => { if (p.type === 'EBD') xpReal += 50; else xpReal += 20; });

        let streakReal = 0;
        if (aluno.attendances.length > 0) {
            streakReal = 1;
            for (let i = aluno.attendances.length - 1; i > 0; i--) {
                const dataAtual = new Date(aluno.attendances[i].date);
                const dataAnterior = new Date(aluno.attendances[i-1].date);
                dataAtual.setHours(0,0,0,0); dataAnterior.setHours(0,0,0,0);
                const diffDias = (dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 3600 * 24);
                if (diffDias === 1) streakReal++; else if (diffDias === 0) {} else break;
            }
            const ultimaData = new Date(aluno.attendances[aluno.attendances.length - 1].date);
            ultimaData.setHours(0,0,0,0);
            const hoje = new Date();
            hoje.setHours(0,0,0,0);
            if ((hoje.getTime() - ultimaData.getTime()) / (1000 * 3600 * 24) > 1) streakReal = 0;
        }
        if (aluno.xp !== xpReal || aluno.currentStreak !== streakReal) {
            await prisma.user.update({ where: { id: aluno.id }, data: { xp: xpReal, currentStreak: streakReal } });
            totalCorrigidos++;
        }
    }
    revalidatePath("/professor"); revalidatePath("/aluno");
    return { success: true, count: totalCorrigidos };
}
// ... (mantenha o resto do arquivo igual)

// --- NOVO: PROFESSOR MARCA PRESENÇA PARA O ALUNO ---
export async function marcarPresencaPeloProfessor(alunoId: string) {
    "use server";

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    // 1. Verifica se já tem presença hoje
    const jaMarcou = await prisma.attendance.findFirst({
        where: {
            userId: alunoId,
            date: { gte: inicioDoDia, lte: fimDoDia }
        }
    });

    if (jaMarcou) {
        return { success: false, message: "Já possui presença hoje." };
    }

    // 2. Busca dados do aluno para calcular Streak
    const aluno = await prisma.user.findUnique({ where: { id: alunoId } });
    if (!aluno) return { success: false, message: "Aluno não encontrado." };

    let novoStreak = 1;
    if (aluno.lastActivity) {
        const ultimaAtividade = new Date(aluno.lastActivity);
        ultimaAtividade.setHours(0,0,0,0);
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        ontem.setHours(0,0,0,0);

        if (ultimaAtividade.getTime() === ontem.getTime()) {
            novoStreak = aluno.currentStreak + 1;
        } else if (ultimaAtividade.getTime() === inicioDoDia.getTime()) {
            novoStreak = aluno.currentStreak;
        }
    }

    // 3. Cria a presença
    await prisma.attendance.create({
        data: {
            userId: alunoId,
            type: "EBD", // Ou "Culto", se quiser diferenciar depois
            date: new Date()
        }
    });

    // 4. Atualiza o Aluno (+50 XP)
    await prisma.user.update({
        where: { id: alunoId },
        data: {
            xp: { increment: 50 },
            currentStreak: novoStreak,
            lastActivity: new Date()
        }
    });

    // 5. Atualiza a Tribo (Se tiver)
    if (aluno.squadId) {
        await prisma.squad.update({
            where: { id: aluno.squadId },
            data: { totalXp: { increment: 50 } }
        });
    }

    revalidatePath("/professor");
    revalidatePath("/aluno"); // Atualiza a tela do aluno também
    return { success: true, message: "Presença confirmada!" };
}