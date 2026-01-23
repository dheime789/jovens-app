"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function criarLicaoComQuiz(data: {
    titulo: string;
    conteudo: string;
    perguntas: any[];
}) {

    // 1. Cria a lição
    const novaLicao = await prisma.lesson.create({
        data: {
            title: data.titulo,
            content: data.conteudo,
            date: new Date(),
            isPublished: true,
            // 2. Cria as perguntas TUDO JUNTO
            questions: {
                create: data.perguntas.map((p: any) => ({
                    text: p.text,
                    optionA: p.optionA,
                    optionB: p.optionB,
                    optionC: p.optionC,
                    optionD: p.optionD,
                    correctOption: p.correctOption,
                    xpReward: 50
                }))
            }
        }
    });

    revalidatePath("/aluno");
    revalidatePath("/professor");
    return novaLicao;
}