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

    // 1. Define o intervalo de tempo de "HOJE"
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    // 2. VERIFICAÇÃO DE SEGURANÇA: Já marcou hoje?
    const jaMarcou = await prisma.attendance.findFirst({
        where: {
            userId: userId,
            date: {
                gte: inicioDoDia,
                lte: fimDoDia
            }
        }
    });

    if (jaMarcou) {
        return { success: false, message: "Você já marcou presença hoje!" };
    }

    // --- CORREÇÃO DO FOGUINHO (STREAK) ---

    // Busca os dados atuais do aluno para ver a última atividade
    const aluno = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!aluno) return { success: false };

    let novoStreak = 1; // O padrão é começar com 1 dia

    // Lógica para ver se é dia consecutivo
    const ultimaAtividade = new Date(aluno.lastActivity);
    ultimaAtividade.setHours(0,0,0,0);

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(0,0,0,0);

    // Se a última atividade foi ONTEM, então aumenta a chama! 🔥
    if (ultimaAtividade.getTime() === ontem.getTime()) {
        novoStreak = aluno.currentStreak + 1;
    }
    // Se a última atividade foi HOJE (algum bug), mantém o atual
    else if (ultimaAtividade.getTime() === inicioDoDia.getTime()) {
        novoStreak = aluno.currentStreak;
    }
    // Se foi antes de ontem, quebrou a ofensiva, volta para 1 (já definido no let)

    // 3. Cria a presença no histórico
    await prisma.attendance.create({
        data: {
            userId: userId,
            type: "EBD",
            date: new Date()
        }
    });

    // 4. Atualiza XP + STREAK + DATA DA ÚLTIMA ATIVIDADE
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: { increment: 20 },
            currentStreak: novoStreak,
            lastActivity: new Date() // <--- Atualiza a data para "agora"
        }
    });

    revalidatePath("/aluno");
    return { success: true, message: "Presença confirmada! +20 XP" };
}