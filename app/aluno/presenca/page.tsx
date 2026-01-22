import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function PresencaPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    // Verifica se já marcou presença hoje
    const hojeInicio = new Date();
    hojeInicio.setHours(0,0,0,0);

    const presencaHoje = await prisma.attendance.findFirst({
        where: {
            userId: userId,
            date: { gte: hojeInicio }
        }
    });

    async function marcarPresenca() {
        "use server";
        const c = await cookies();
        const uid = c.get("aluno_logado")?.value;
        if (!uid) return;

        // --- MUDANÇA AQUI ---
        // Agora salva como "EBD" em vez de Culto
        await prisma.attendance.create({
            data: {
                userId: uid,
                type: "EBD", // <--- MUDADO AQUI
                date: new Date()
            }
        });

        // Dá XP para o aluno! (Aumentei para 50, já que EBD é a aula principal)
        await prisma.user.update({
            where: { id: uid },
            data: {
                xp: { increment: 50 }, // <--- AGORA GANHA 50 PONTOS
                currentStreak: { increment: 1 }
            }
        });

        redirect("/aluno/presenca?sucesso=true");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <Link href="/aluno"><Button variant="ghost" className="mb-4 text-slate-400">← Voltar</Button></Link>

            <h1 className="text-2xl font-bold mb-2">Chamada EBD 📖</h1>
            <p className="text-slate-400 mb-8">Confirme sua presença na Escola Bíblica.</p>

            <Card className="bg-slate-900 border-slate-800 mb-8">
                <CardContent className="p-8 flex flex-col items-center text-center">

                    {presencaHoje ? (
                        // SE JÁ MARCOU HOJE
                        <div className="animate-in zoom-in duration-500">
                            <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4 mx-auto">
                                <CalendarCheck size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-green-400">Presença Confirmada!</h2>
                            <p className="text-slate-400 text-sm mt-2">Você garantiu seus 50 XP de hoje.</p>
                        </div>
                    ) : (
                        // SE AINDA NÃO MARCOU
                        <div>
                            <div className="h-20 w-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mb-4 mx-auto animate-pulse">
                                <MapPin size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Você está na Aula?</h2>
                            <p className="text-slate-400 text-sm mt-2 mb-6">Clique abaixo para confirmar sua presença na EBD.</p>

                            <form action={marcarPresenca}>
                                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/20">
                                    CONFIRMAR PRESENÇA NA EBD
                                </Button>
                            </form>
                        </div>
                    )}

                </CardContent>
            </Card>

            <div className="bg-yellow-900/10 border border-yellow-900/30 p-4 rounded-lg flex gap-3">
                <AlertCircle className="text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-600">
                    Atenção: A chamada fecha automaticamente ao final da aula. Marque sua presença enquanto estiver na classe! 🛡️
                </p>
            </div>

        </div>
    );
}