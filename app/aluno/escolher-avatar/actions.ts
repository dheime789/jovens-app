"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function salvarAvatar(avatarEscolhido: string) {
    const c = await cookies();
    const userId = c.get("aluno_logado")?.value;

    if (!userId) return;

    await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarEscolhido }
    });

    revalidatePath("/aluno");
    redirect("/aluno"); // Manda de volta para o Dashboard
}