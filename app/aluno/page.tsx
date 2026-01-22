import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    Trophy,
    CalendarCheck,
    User,
    LogOut,
    TrendingUp,
    Medal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Função para calcular quanto falta para o próximo nível
// (Exemplo: Nível * 1000 XP)
function calcularProgresso(xp: number, nivel: number) {
    const xpProximoNivel = nivel * 1000;
    const progresso = (xp / xpProximoNivel) * 100;
    return Math.min(progresso, 100); // Trava em 100%
}

export default async function AlunoDashboard() {
    // 1. SEGURANÇA: Verifica se o aluno está logado
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;

    if (!userId) {
        redirect("/login");
    }

    // 2. BUSCA OS DADOS DO ALUNO NO BANCO
    const aluno = await prisma.user.findUnique({
        where: { id: userId },
        include: { squad: true } // Traz o nome da Tribo junto
    });

    if (!aluno) {
        redirect("/login"); // Se o aluno foi deletado, chuta para fora
    }

    // 3. BUSCA O HISTÓRICO DE PRESENÇAS DELE
    const presencas = await prisma.attendance.findMany({
        where: { userId: aluno.id },
        orderBy: { date: 'desc' },
        take: 10 // Mostra só as últimas 10
    });

    // 4. AÇÃO DE SAIR (Logout)
    async function sair() {
        "use server";
        const c = await cookies();
        c.delete("aluno_logado");
        redirect("/login");
    }

    const progressoNivel = calcularProgresso(aluno.xp, aluno.level);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">

            {/* CABEÇALHO */}
            <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-violet-600 rounded-full flex items-center justify-center text-xl font-bold">
                            {aluno.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{aluno.name}</h1>
                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                <Medal size={14} className="text-yellow-500"/>
                                Tribo: {aluno.squad?.name || "Sem Tribo"}
                            </p>
                        </div>
                    </div>
                    <form action={sair}>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-950/30">
                            <LogOut size={20} />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* CARTÃO DE NÍVEL E XP */}
                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy size={100} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-sm font-medium">Seu Progresso</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold text-white">{aluno.xp} <span className="text-sm text-slate-500">XP</span></span>
                            <span className="text-xl font-bold text-violet-400">Nível {aluno.level}</span>
                        </div>
                        <Progress value={progressoNivel} className="h-3 bg-slate-800" />
                        <p className="text-xs text-slate-500 mt-2 text-right">
                            {Math.floor(progressoNivel)}% para o próximo nível
                        </p>
                    </CardContent>
                </Card>

                {/* ESTATÍSTICAS RÁPIDAS */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <CalendarCheck className="mb-2 text-green-500" size={24} />
                            <span className="text-2xl font-bold text-white">{presencas.length}</span>
                            <span className="text-xs text-slate-400">Presenças</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <TrendingUp className="mb-2 text-blue-500" size={24} />
                            <span className="text-2xl font-bold text-white">#{aluno.level * 10 + 5}</span>
                            <span className="text-xs text-slate-400">Ranking Geral</span>
                        </CardContent>
                    </Card>
                </div>

                {/* HISTÓRICO DE PRESENÇA */}
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <CalendarCheck size={18} className="text-violet-500"/>
                        Últimas Atividades
                    </h2>

                    {presencas.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
                            <p>Nenhuma presença registrada ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {presencas.map((p) => (
                                <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${p.type === 'EBD' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-white">{p.type === 'EBD' ? 'Escola Bíblica' : 'Culto de Jovens'}</h3>
                                            <p className="text-xs text-slate-400">
                                                {new Date(p.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-green-400 font-bold text-sm">+ {p.type === 'EBD' ? '50' : '20'} XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}