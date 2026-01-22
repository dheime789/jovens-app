import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AVATARES = ["🦁", "🦅", "🐻", "🐯", "🐺", "🦊", "🐲", "🦍", "🦉", "🦄", "⚡", "🔥", "🛡️", "⚔️", "💎", "🚀"];

export default async function EscolherAvatarPage() {

    async function salvarAvatar(emoji: string) {
        "use server";
        const c = await cookies();
        const userId = c.get("aluno_logado")?.value;
        if (!userId) return;

        await prisma.user.update({
            where: { id: userId },
            data: { avatar: emoji } // Salva o emoji direto no banco
        });

        redirect("/aluno"); // Volta pro painel
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-2 text-center">Quem é você na guerra?</h1>
            <p className="text-slate-400 mb-8 text-center">Escolha seu avatar de batalha</p>

            <div className="grid grid-cols-4 gap-4 max-w-md">
                {AVATARES.map((emoji) => (
                    <form key={emoji} action={async () => { "use server"; await salvarAvatar(emoji); }}>
                        <Button variant="outline" className="h-16 w-16 text-3xl bg-slate-900 border-slate-800 hover:bg-violet-900/50 hover:border-violet-500 hover:scale-110 transition-all">
                            {emoji}
                        </Button>
                    </form>
                ))}
            </div>
        </div>
    );
}