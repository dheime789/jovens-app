import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Trophy, CalendarCheck, LogOut, Medal, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default async function AlunoDashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    const aluno = await prisma.user.findUnique({
        where: { id: userId },
        include: { squad: true }
    });

    // SE NÃO TIVER TRIBO, MANDA ESCOLHER!
    if (aluno && !aluno.squadId) {
        redirect("/aluno/escolher-tribo");
    }

    if (!aluno) redirect("/login");

    // BUSCA O RANKING (TOP 5)
    const ranking = await prisma.user.findMany({
        where: { role: "JOVEM" },
        orderBy: { xp: 'desc' },
        take: 5,
        include: { squad: true }
    });

    // BUSCA HISTÓRICO
    const presencas = await prisma.attendance.findMany({
        where: { userId: aluno.id },
        orderBy: { date: 'desc' },
        take: 5
    });

    async function sair() {
        "use server";
        const c = await cookies();
        c.delete("aluno_logado");
        redirect("/login");
    }

    const progresso = Math.min((aluno.xp / (aluno.level * 1000)) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">

            {/* HEADER */}
            <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-violet-600 rounded-full flex items-center justify-center font-bold">
                            {aluno.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="font-bold">{aluno.name}</h1>
                            <p className="text-xs text-slate-400">{aluno.squad?.name}</p>
                        </div>
                    </div>
                    <form action={sair}><Button variant="ghost" size="icon" className="text-red-500"><LogOut size={18} /></Button></form>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* STATUS CARD */}
                <Card className="bg-gradient-to-br from-violet-900/50 to-slate-900 border-violet-500/30">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-4xl font-black text-white mb-1">{aluno.xp} XP</h2>
                        <p className="text-violet-300 font-bold mb-4">NÍVEL {aluno.level}</p>
                        <Progress value={progresso} className="h-2 bg-slate-800" />
                        <p className="text-xs text-slate-500 mt-2">{Math.floor(progresso)}% para o próximo nível</p>
                    </CardContent>
                </Card>

                {/* RANKING DOS GUERREIROS */}
                <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-yellow-500">
                        <Crown size={20} /> Top Guerreiros
                    </h3>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        {ranking.map((jovem, index) => (
                            <div key={jovem.id} className={`flex items-center justify-between p-4 border-b border-slate-800 last:border-0 ${jovem.id === aluno.id ? "bg-violet-900/20" : ""}`}>
                                <div className="flex items-center gap-3">
                  <span className={`font-bold w-6 text-center ${index === 0 ? "text-yellow-400 text-xl" : "text-slate-500"}`}>
                    {index + 1}º
                  </span>
                                    <div>
                                        <p className="font-bold text-sm text-white">{jovem.name} {jovem.id === aluno.id && "(Você)"}</p>
                                        <p className="text-xs text-slate-500">{jovem.squad?.name || "Sem tribo"}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-violet-400 text-sm">{jovem.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÚLTIMAS ATIVIDADES */}
                <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-300">
                        <CalendarCheck size={20} /> Histórico
                    </h3>
                    <div className="space-y-2">
                        {presencas.map((p) => (
                            <div key={p.id} className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                <span className="text-sm text-slate-300">{p.type}</span>
                                <span className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString('pt-BR')}</span>
                                <span className="text-green-400 font-bold text-sm">+{p.type === 'EBD' ? 50 : 20} XP</span>
                            </div>
                        ))}
                        {presencas.length === 0 && <p className="text-slate-500 text-sm text-center">Nenhuma atividade ainda.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}