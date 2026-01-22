import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default async function EscolherTriboPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    // Lista as tribos disponíveis
    const tribos = await prisma.squad.findMany();

    async function escolherTribo(squadId: string) {
        "use server";
        const c = await cookies();
        const uid = c.get("aluno_logado")?.value;
        if(!uid) return;

        await prisma.user.update({
            where: { id: uid },
            data: { squadId: squadId }
        });
        redirect("/aluno");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-2">Escolha sua Aliança</h1>
            <p className="text-slate-400 mb-8 text-center">Você precisa de uma tribo para entrar na guerra.</p>

            <div className="grid gap-4 w-full max-w-md">
                {tribos.map((tribo) => (
                    <Card key={tribo.id} className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between hover:border-violet-500 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-violet-900/30 rounded-full flex items-center justify-center text-violet-400">
                                <Shield size={24} />
                            </div>
                            <span className="font-bold text-lg text-white">{tribo.name}</span>
                        </div>
                        <form action={async () => {
                            "use server";
                            await escolherTribo(tribo.id);
                        }}>
                            <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700">
                                ESCOLHER
                            </Button>
                        </form>
                    </Card>
                ))}
            </div>
        </div>
    );
}