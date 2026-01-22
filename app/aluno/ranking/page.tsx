import { prisma } from "@/lib/prisma";
import { Trophy, Shield, Medal, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Import Button

export default async function RankingPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    // Busca Top 20 Jovens
    const topJovens = await prisma.user.findMany({
        where: { role: "JOVEM" },
        orderBy: { xp: 'desc' },
        take: 20,
        include: { squad: true }
    });

    // Busca Top Tribos (Calcula somando XP dos membros)
    const tribos = await prisma.squad.findMany({ include: { members: true } });
    const rankingTribos = tribos.map(t => ({
        ...t,
        totalXp: t.members.reduce((acc, m) => acc + m.xp, 0)
    })).sort((a, b) => b.totalXp - a.totalXp);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-20">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/aluno"><Button variant="ghost" className="text-slate-400">← Voltar</Button></Link>
                <h1 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-yellow-500"/> Ranking Global</h1>
            </div>

            {/* PODIO DAS TRIBOS */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Guerra das Tribos</h2>
                {rankingTribos.map((tribo, index) => (
                    <Card key={tribo.id} className={`border-none ${index === 0 ? "bg-gradient-to-r from-yellow-900/20 to-slate-900 border border-yellow-500/30" : "bg-slate-900"}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className={`font-bold text-xl w-6 text-center ${index === 0 ? "text-yellow-500" : "text-slate-500"}`}>{index + 1}º</span>
                                <div className="flex items-center gap-3">
                                    <Shield className={index === 0 ? "text-yellow-500" : "text-slate-600"} size={20}/>
                                    <span className="font-bold">{tribo.name}</span>
                                </div>
                            </div>
                            <span className="font-mono text-slate-300">{tribo.totalXp} XP</span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* LISTA DE GUERREIROS */}
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Melhores Guerreiros</h2>
            <div className="space-y-2">
                {topJovens.map((jovem, index) => (
                    <div key={jovem.id} className={`flex items-center justify-between p-3 rounded-lg ${jovem.id === userId ? "bg-violet-900/20 border border-violet-500/30" : "bg-slate-900 border border-slate-800"}`}>
                        <div className="flex items-center gap-3">
                            <span className={`font-bold w-6 text-center ${index < 3 ? "text-yellow-400" : "text-slate-500"}`}>{index + 1}</span>

                            {/* Avatar do Jovem (Emoji) */}
                            <span className="text-lg">{jovem.avatar && jovem.avatar.length < 5 ? jovem.avatar : "👤"}</span>

                            <div>
                                <p className={`text-sm font-bold ${jovem.id === userId ? "text-violet-300" : "text-white"}`}>
                                    {jovem.name} {jovem.id === userId && "(Você)"}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase">{jovem.squad?.name}</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-violet-400">{jovem.xp} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
}