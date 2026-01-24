import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

// Lista Expandida de Avatares (Mais opções para eles)
const AVATARES = [
    "🦁", "🐯", "🐺", "🐻", "🐨", "🐼",
    "🐸", "🦊", "🐲", "🦖", "🐙", "🦈",
    "🦅", "🦉", "🦋", "🐝", "🐞", "🐜",
    "🦍", "🦧", "🦣", "🐘", "🦏", "🦛",
    "👮", "🕵️", "💂", "🥷", "🦸", "🦹",
    "🧙", "🧝", "🧛", "🧟", "🧞", "🧜",
    "🤖", "👾", "👽", "👻", "💀", "💩"
];

export default async function EscolherAvatarPage() {

    async function salvarAvatar(emoji: string) {
        "use server";
        const c = await cookies();
        const userId = c.get("aluno_logado")?.value;
        if (!userId) return;

        await prisma.user.update({
            where: { id: userId },
            data: { avatar: emoji }
        });

        redirect("/aluno");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full text-center space-y-6">

                <div>
                    <h1 className="text-3xl font-bold mb-2 text-white">Quem é você na guerra? ⚔️</h1>
                    <p className="text-slate-400">Escolha o avatar que vai aparecer no Ranking.</p>
                </div>

                {/* Grade Responsiva (4 por linha no celular, 6 ou 8 no PC) */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    {AVATARES.map((emoji) => (
                        <form key={emoji} action={async () => { "use server"; await salvarAvatar(emoji); }}>
                            <Button
                                variant="ghost"
                                className="w-full h-14 text-3xl hover:bg-slate-800 hover:scale-125 transition-transform duration-200"
                            >
                                {emoji}
                            </Button>
                        </form>
                    ))}
                </div>

                <p className="text-xs text-slate-500">
                    Clique no emoji para salvar e entrar.
                </p>
            </div>
        </div>
    );
}