"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function marcarPresenca(formData: FormData) {
    const c = await cookies();
    const userId = c.get("aluno_logado")?.value;

    if (!userId) {
        return { success: false, message: "Erro: Usuário não identificado." };
    }

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const jaMarcou = await prisma.attendance.findFirst({
        where: {
            userId: userId,
            date: { gte: inicioDoDia, lte: fimDoDia }
        }
    });

    if (jaMarcou) {
        return { success: false, message: "Você já marcou presença hoje!" };
    }

    // --- LÓGICA DO STREAK (DIAS SEGUIDOS) ---
    const aluno = await prisma.user.findUnique({ where: { id: userId } });
    if (!aluno) return { success: false };

    let novoStreak = 1;
    const ultimaAtividade = new Date(aluno.lastActivity);
    ultimaAtividade.setHours(0,0,0,0);

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(0,0,0,0);

    // Se a última atividade foi ONTEM, aumenta +1
    if (ultimaAtividade.getTime() === ontem.getTime()) {
        novoStreak = aluno.currentStreak + 1;
    }
    // Se foi hoje (bug), mantém
    else if (ultimaAtividade.getTime() === inicioDoDia.getTime()) {
        novoStreak = aluno.currentStreak;
    }
    // Se foi antes, reseta pra 1 (já está no let)

    await prisma.attendance.create({
        data: {
            userId: userId,
            type: "EBD",
            date: new Date()
        }
    });

    // --- CORREÇÃO DE VALOR: AGORA É 50 XP (Igual ao visual e exclusão) ---
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: 50 }, // <--- MUDADO DE 20 PARA 50
            currentStreak: novoStreak,
            lastActivity: new Date()
        }
    });

    revalidatePath("/aluno");
    return { success: true, message: "Presença confirmada! +50 XP" };
}