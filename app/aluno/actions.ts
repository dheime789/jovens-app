"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function marcarPresenca() {
    const c = await cookies();
    const userId = c.get("aluno_logado")?.value;

    if (!userId) {
        return { success: false, message: "Erro: Usuário não identificado." };
    }

    // 1. Define o intervalo de tempo de "HOJE" (00:00 até 23:59)
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    // 2. VERIFICAÇÃO DE SEGURANÇA: Já marcou hoje?
    const jaMarcou = await prisma.attendance.findFirst({
        where: {
            userId: userId,
            date: {
                gte: inicioDoDia, // Maior ou igual a 00:00
                lte: fimDoDia     // Menor ou igual a 23:59
            }
        }
    });

    if (jaMarcou) {
        // Se já achou registro, PARA TUDO e avisa o erro
        return { success: false, message: "Você já marcou presença hoje!" };
    }

    // 3. Se não marcou, cria a presença e dá o XP
    await prisma.attendance.create({
        data: {
            userId: userId,
            type: "EBD", // Você pode mudar isso se quiser diferenciar cultos
            date: new Date()
        }
    });

    // Ganha 20 XP pela presença
    await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 20 } }
    });

    revalidatePath("/aluno"); // Atualiza a tela
    return { success: true, message: "Presença confirmada! +20 XP" };
}