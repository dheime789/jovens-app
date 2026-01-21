// lib/auth.ts
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getLoggedUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return null; // Ninguém logado
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { squad: true }
    });

    return user;
}

export async function requireUser() {
    const user = await getLoggedUser();
    if (!user) {
        redirect("/login");
    }
    return user;
}