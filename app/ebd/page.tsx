import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function EbdPage() {

    // 1. ACHAR VOCÊ NO BANCO
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!user) redirect("/cadastro");

    // 2. VERIFICAR SE JÁ MARCOU PRESENÇA HOJE
    const hojeStart = new Date();
    hojeStart.setHours(0, 0, 0, 0);

    const presencaHoje = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            date: { gte: hojeStart }
        }
    });

    // --- AÇÃO: MARCAR PRESENÇA E PONTUAR A TRIBO ---
    async function marcarPresenca() {
        "use server";

        const dbUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
        if (!dbUser) return;

        // 1. Cria o registro de presença
        await prisma.attendance.create({
            data: { userId: dbUser.id, type: "EBD" }
        });

        // 2. Dá o XP para o USUÁRIO (+50)
        await prisma.user.update({
            where: { id: dbUser.id },
            data: {
                xp: { increment: 50 },
                currentStreak: { increment: 1 },
                lastActivity: new Date()
            }
        });

        // 3. Dá o XP para a TRIBO (+50) <--- NOVIDADE AQUI!
        if (dbUser.squadId) {
            await prisma.squad.update({
                where: { id: dbUser.squadId },
                data: { totalXp: { increment: 50 } }
            });
        }

        revalidatePath("/");
        revalidatePath("/ebd");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">

            <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={20} /> Voltar
            </Link>

            <div className="max-w-md w-full text-center space-y-8 mt-10">
                <div className="h-24 w-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400 animate-pulse">
                    <Calendar size={48} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-2">Escola Bíblica</h1>
                    <p className="text-slate-400">Domingo de aprendizado e comunhão.</p>
                </div>

                {presencaHoje ? (
                    <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                        <CheckCircle size={48} className="text-green-500" />
                        <div>
                            <h2 className="text-xl font-bold text-green-400">Presença Confirmada!</h2>
                            <p className="text-sm text-green-300/80">+50 XP para você e sua Tribo.</p>
                        </div>
                        <Link href="/">
                            <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20 w-full">
                                Voltar ao Início
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form action={marcarPresenca}>
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 text-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            MARCAR PRESENÇA AGORA
                        </Button>
                        <p className="text-xs text-slate-500 mt-4">
                            Ao clicar, você confirma que está presente na aula. Deus está vendo! 👀
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}