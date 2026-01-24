"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function salvarResultado(lessonId: string, acertos: number, totalPerguntas: number) {
    const c = await cookies();
    const userId = c.get("aluno_logado")?.value;
    if (!userId) return;

    // 1. Verifica se já jogou essa lição
    const jaJogou = await prisma.quizResult.findFirst({
        where: {
            userId: userId,
            question: { lessonId: lessonId }
        }
    });

    if (jaJogou) {
        return { message: "Você já completou este quiz antes!" };
    }

    // 2. Registra que jogou (pega a primeira pergunta para vincular)
    const primeiraPergunta = await prisma.question.findFirst({
        where: { lessonId: lessonId }
    });

    if (primeiraPergunta) {
        await prisma.quizResult.create({
            data: {
                userId: userId,
                questionId: primeiraPergunta.id,
                isCorrect: acertos > 0,
            }
        });
    }

    // 3. Dá o XP (50 pontos por acerto)
    const xpGanho = acertos * 50;

    if (xpGanho > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpGanho }
            }
        });
    }

    revalidatePath("/aluno");
    return { success: true, xp: xpGanho };
}