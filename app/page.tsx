import { getLoggedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// ADICIONEI O 'BookOpen' AQUI NAS IMPORTAÇÕES
import { Flame, Trophy, Calendar, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function Home() {

    // 1. BUSCAR O USUÁRIO LOGADO
    const dbUser = await getLoggedUser();

    if (!dbUser) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6 p-4 text-center">
                <div className="bg-violet-500/20 p-6 rounded-full animate-pulse">
                    <Shield size={64} className="text-violet-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Jovens de Valor</h1>
                    <p className="text-slate-400">Entre para competir e crescer espiritualmente.</p>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Link href="/login" className="w-full">
                        <Button className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-6 text-lg">
                            FAZER LOGIN
                        </Button>
                    </Link>
                    <Link href="/cadastro" className="w-full">
                        <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-300">
                            Criar Nova Conta
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // 2. BUSCAR O RANKING
    const ranking = await prisma.user.findMany({
        take: 3,
        orderBy: { xp: 'desc' },
        include: { squad: true }
    });

    // 3. ORGANIZAR DADOS DO USUÁRIO
    const user = {
        name: dbUser.name,
        level: dbUser.level,
        xp: dbUser.xp,
        nextLevelXp: 1000 * dbUser.level,
        streak: dbUser.currentStreak,
        squad: dbUser.squad?.name || "Sem Tribo",
        avatar: dbUser.avatar || "1"
    };

    const progressPercentage = (user.xp / user.nextLevelXp) * 100;

    const avatarMap: Record<string, string> = {
        "1": "🧑", "2": "🦁", "3": "🦅", "4": "👑",
        "5": "🛡️", "6": "🐑", "7": "🔥", "8": "⚔️"
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-20">

            {/* --- CABEÇALHO DO PERFIL --- */}
            <div className="bg-gradient-to-b from-violet-900 to-slate-950 p-6 rounded-b-3xl shadow-2xl shadow-violet-900/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">

                        <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-900/50 text-3xl shadow-lg relative">
                            {avatarMap[user.avatar]}
                            <div className="absolute -bottom-1 -right-1 bg-violet-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-900">
                                Lvl {user.level}
                            </div>
                        </div>

                        <div>
                            <h1 className="font-bold text-xl">{user.name}</h1>
                            <div className="flex items-center gap-1 text-slate-300 text-sm">
                                <Shield size={12} />
                                <span>{user.squad}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-violet-200 font-medium">
                        <span>XP: {user.xp}</span>
                        <span>Próximo: {user.nextLevelXp}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-slate-800" />
                </div>
            </div>

            {/* --- STATUS DA CHAMA (STREAK) --- */}
            <div className="px-6 -mt-8">
                <Card className="bg-slate-900 border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Flame size={100} />
                    </div>
                    <CardContent className="p-6 flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Ofensiva Espiritual</p>
                            <h2 className="text-3xl font-black text-white flex items-center gap-2">
                                {user.streak} Dias
                                <Flame className={`text-orange-500 fill-orange-500 ${user.streak > 0 ? 'animate-pulse' : ''}`} size={32} />
                            </h2>
                            <p className="text-xs text-orange-400 mt-1">
                                {user.streak === 0 ? "Comece hoje!" : "Não deixe apagar!"}
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                            <Flame className="text-orange-500" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- MENU RÁPIDO --- */}
            <div className="px-6 mt-6 grid grid-cols-2 gap-4">
                <Link href="/ebd" className="block h-full">
                    <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center justify-center h-full">
                            <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">EBD</h3>
                                <p className="text-xs text-slate-400">Marcar Presença</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/estudo" className="block h-full">
                    <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer h-full">
                        <CardContent className="p-4 flex flex-col items-center gap-3 text-center justify-center h-full">
                            {/* --- AQUI: MUDEI PARA O ÍCONE DE LIVRO E TEXTO DE ESTUDO --- */}
                            <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Estudo da Semana</h3>
                                <p className="text-xs text-slate-400">Ler & Responder</p>
                            </div>
                            {/* -------------------------------------------------------- */}
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* --- RANKING GERAL --- */}
            <div className="px-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Top Guerreiros 🏆</h3>
                </div>

                <div className="space-y-3">
                    {ranking.map((guerreiro, index) => (
                        <div key={guerreiro.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className={`font-bold w-6 text-center text-lg
                                  ${index === 0 ? 'text-yellow-400' :
                                    index === 1 ? 'text-slate-300' :
                                        index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                                  #{index + 1}
                                </span>

                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-sm border border-slate-700">
                                        {avatarMap[guerreiro.avatar || "1"]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">
                                            {guerreiro.name} {index === 0 && "👑"}
                                        </span>
                                        <span className="text-[10px] text-slate-400 uppercase">
                                            {guerreiro.squad?.name || "Sem Tribo"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <span className="text-xs font-bold text-violet-400 bg-violet-400/10 px-2 py-1 rounded">
                                {guerreiro.xp} XP
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}