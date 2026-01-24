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