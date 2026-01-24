"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function excluirLicao(id: string) {
    // 1. Apaga o histórico de quem leu essa lição
    await prisma.lessonHistory.deleteMany({
        where: { lessonId: id }
    });

    // 2. Apaga os resultados de Quiz dos alunos (precisa achar as perguntas antes)
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

    // 3. Apaga as perguntas da lição
    await prisma.question.deleteMany({
        where: { lessonId: id }
    });

    // 4. FINALMENTE: Apaga a lição
    await prisma.lesson.delete({
        where: { id: id }
    });

    revalidatePath("/professor");
    revalidatePath("/aluno");
}
// Adicione isso no final do arquivo app/professor/actions.ts

export async function reformularTribos() {
    "use server";

    // 1. Lista das tribos que VÃO FICAR (e seus emojis)
    const tribosOficiais = [
        { name: "Tribo de Judá 🦁" },
        { name: "Tribo de Levi 🛡️" }
    ];

    // 2. Garante que Judá e Levi existem (cria se não existirem)
    for (const t of tribosOficiais) {
        const existe = await prisma.squad.findFirst({ where: { name: t.name } });
        if (!existe) {
            await prisma.squad.create({ data: { name: t.name, totalXp: 0 } });
        }
    }

    // 3. Busca todas as tribos do banco
    const todasTribos = await prisma.squad.findMany();

    // 4. Filtra as tribos que DEVEM SER APAGADAS (quem não é Judá nem Levi)
    const tribosParaExcluir = todasTribos.filter(t =>
        t.name !== "Tribo de Judá 🦁" &&
        t.name !== "Tribo de Levi 🛡️"
    );

    // 5. O PROCESSO DE SEGURANÇA (Cuida dos Órfãos)
    for (const tribo of tribosParaExcluir) {
        // A. Acha os alunos dessa tribo
        const alunosOrfaos = await prisma.user.findMany({ where: { squadId: tribo.id } });

        // B. Remove a tribo deles (deixa null).
        // Assim, no próximo login, eles serão forçados a escolher entre Judá e Levi.
        if (alunosOrfaos.length > 0) {
            await prisma.user.updateMany({
                where: { squadId: tribo.id },
                data: { squadId: null }
            });
        }

        // C. Agora que a tribo está vazia, pode apagar sem medo
        await prisma.squad.delete({ where: { id: tribo.id } });
    }

    revalidatePath("/aluno/ranking");
    revalidatePath("/aluno/escolher-tribo");
    return { success: true, message: "Tribos reformuladas: Apenas Judá e Levi permanecem!" };
}