import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    BookOpen,
    Trophy,
    CalendarCheck,
    LogOut,
    BrainCircuit,
    Swords,
    ChevronRight,
    Flame
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function AlunoDashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    const aluno = await prisma.user.findUnique({
        where: { id: userId },
        include: { squad: true }
    });

    if (!aluno) redirect("/login");

    // 1. SE NÃO TIVER TRIBO -> MANDA ESCOLHER
    if (!aluno.squadId) {
        redirect("/aluno/escolher-tribo");
    }

    // 2. SE O AVATAR AINDA FOR O PADRÃO ("1") -> MANDA ESCOLHER EMOJI
    // (Isso garante que todo mundo tenha um emoji legal)
    if (aluno.avatar === "1") {
        redirect("/aluno/escolher-avatar");
    }

    // Busca a próxima lição disponível (Exemplo)
    const proximaLicao = await prisma.lesson.findFirst({
        where: { isPublished: true },
        orderBy: { date: 'desc' }
    });

    async function sair() {
        "use server";
        const c = await cookies();
        c.delete("aluno_logado");
        redirect("/login");
    }

    // Cálculo de Nível
    const xpProximoNivel = aluno.level * 1000;
    const progresso = Math.min((aluno.xp / xpProximoNivel) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">

            {/* --- CABEÇALHO PERFIL --- */}
            <div className="bg-gradient-to-b from-violet-900/40 to-slate-950 border-b border-slate-800 p-6 pt-10">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        {/* Avatar do Usuário (EMOJI) */}
                        {/* Mudamos aqui para mostrar o Emoji e o fundo escuro */}
                        <div className="h-14 w-14 rounded-full bg-slate-900 border-2 border-violet-500 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                            {aluno.avatar}
                        </div>

                        <div>
                            <h1 className="font-bold text-xl">{aluno.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="bg-slate-800 px-2 py-0.5 rounded text-violet-300 font-bold border border-slate-700">Lvl {aluno.level}</span>
                                <span className="flex items-center gap-1 text-yellow-500"><Flame size={14}/> {aluno.currentStreak} dias</span>
                            </div>
                        </div>
                    </div>

                    <form action={sair}>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-900/20 hover:text-red-300">
                            <LogOut size={22} />
                        </Button>
                    </form>
                </div>

                {/* Barra de XP */}
                <div className="max-w-md mx-auto mt-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>XP Atual: {aluno.xp}</span>
                        <span>Próx: {xpProximoNivel}</span>
                    </div>
                    <Progress value={progresso} className="h-2 bg-slate-900 border border-slate-800" />
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8">

                {/* --- MENU PRINCIPAL (GRID BONITO) --- */}
                <div>
                    <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                        <Swords className="text-violet-500" size={20} /> Central de Comando
                    </h2>

                    <div className="grid grid-cols-2 gap-4">

                        {/* Botão Lições */}
                        <Link href="/aluno/licoes">
                            <Card className="bg-slate-900 border-slate-800 hover:border-violet-500 hover:bg-slate-800 transition-all cursor-pointer h-full">
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="h-10 w-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
                                        <BookOpen size={24} />
                                    </div>
                                    <span className="font-bold text-white">Lições</span>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Botão Quiz */}
                        <Link href="/aluno/quiz">
                            <Card className="bg-slate-900 border-slate-800 hover:border-pink-500 hover:bg-slate-800 transition-all cursor-pointer h-full">
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="h-10 w-10 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-400">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <span className="font-bold text-white">Quiz</span>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Botão Ranking */}
                        <Link href="/aluno/ranking">
                            <Card className="bg-slate-900 border-slate-800 hover:border-yellow-500 hover:bg-slate-800 transition-all cursor-pointer h-full">
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-400">
                                        <Trophy size={24} />
                                    </div>
                                    <span className="font-bold text-white">Ranking</span>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Botão Presença */}
                        <Link href="/aluno/presenca">
                            <Card className="bg-slate-900 border-slate-800 hover:border-green-500 hover:bg-slate-800 transition-all cursor-pointer h-full">
                                <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
                                    <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-400">
                                        <CalendarCheck size={24} />
                                    </div>
                                    <span className="font-bold text-white">Histórico</span>
                                </CardContent>
                            </Card>
                        </Link>

                    </div>
                </div>

                {/* --- DESTAQUE DA SEMANA --- */}
                {proximaLicao && (
                    <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 rounded-xl p-6 border border-violet-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <BookOpen size={80} />
                        </div>
                        <p className="text-violet-300 text-xs font-bold uppercase tracking-wider mb-1">Próxima Lição</p>
                        <h3 className="text-xl font-bold text-white mb-2 max-w-[80%]">{proximaLicao.title}</h3>
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{proximaLicao.content.substring(0, 60)}...</p>

                        <Link href={`/aluno/licoes/${proximaLicao.id}`}>
                            <Button size="sm" className="bg-white text-violet-900 hover:bg-slate-200 font-bold border-0">
                                Ler Agora <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}