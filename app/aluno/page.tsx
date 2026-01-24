import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    Trophy,
    CalendarCheck,
    LogOut,
    BookOpen,
    BrainCircuit,
    Flame,
    MapPin,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { marcarPresenca } from "./actions";

export default async function AlunoDashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    const aluno = await prisma.user.findUnique({
        where: { id: userId },
        include: { squad: true }
    });

    if (!aluno) redirect("/login");

    // 1. Verifica Tribo
    if (!aluno.squadId) redirect("/aluno/escolher-tribo");

    // 2. Verifica Avatar
    if (aluno.avatar === "1") redirect("/aluno/escolher-avatar");

    // --- LÓGICA DE TRAVA DA PRESENÇA ---
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const presencaHoje = await prisma.attendance.findFirst({
        where: {
            userId: aluno.id,
            date: {
                gte: inicioDoDia,
                lte: fimDoDia
            }
        }
    });

    // --- CORREÇÃO VISUAL DO FOGUINHO 🔥 ---
    // Se o aluno marcou hoje (presencaHoje existe), mas o banco diz 0 dias (bug anterior),
    // o sistema força visualmente para mostrar 1 dia.
    const diasSeguidos = (presencaHoje && aluno.currentStreak === 0) ? 1 : aluno.currentStreak;

    // Histórico na tela inicial
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

    const xpProximoNivel = aluno.level * 1000;
    const progresso = Math.min((aluno.xp / xpProximoNivel) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">

            {/* CABEÇALHO */}
            <div className="bg-slate-900 border-b border-slate-800 p-6">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-800 border-2 border-violet-500 flex items-center justify-center text-2xl overflow-hidden">
                            {/* Agora vai mostrar o Emoji escolhido! */}
                            {aluno.avatar}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">{aluno.name}</h1>
                            <p className="text-slate-400 text-xs flex items-center gap-1">
                                <span className="text-violet-400 font-bold">{aluno.squad?.name}</span>
                            </p>
                        </div>
                    </div>
                    <form action={sair}>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-950/30">
                            <LogOut size={20} />
                        </Button>
                    </form>
                </div>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-6">

                {/* CARTÃO DE NÍVEL */}
                <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy size={80} />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-400 text-sm font-medium flex justify-between">
                            <span>Seu Progresso</span>
                            {/* AQUI ESTÁ A VARIÁVEL CORRIGIDA (diasSeguidos) */}
                            <span className="text-yellow-500 flex items-center gap-1"><Flame size={14}/> {diasSeguidos} dias seguidos</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-bold text-white">{aluno.xp} <span className="text-sm text-slate-500">XP</span></span>
                            <span className="text-xl font-bold text-violet-400">Nível {aluno.level}</span>
                        </div>
                        <Progress value={progresso} className="h-3 bg-slate-800" />
                        <p className="text-xs text-slate-500 mt-2 text-right">
                            Faltam {xpProximoNivel - aluno.xp} XP para subir
                        </p>
                    </CardContent>
                </Card>

                {/* --- ÁREA DE CHECK-IN INTELIGENTE --- */}
                <Card className="border-slate-800 bg-slate-900 overflow-hidden relative">
                    {!presencaHoje && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-600/20 blur-2xl rounded-full pointer-events-none"></div>
                    )}
                    <CardContent className="p-0">
                        {presencaHoje ? (
                            // SE JÁ MARCOU: MOSTRA VERDE E BLOQUEADO
                            <div className="flex items-center justify-between p-4 bg-green-950/20 border-l-4 border-green-500">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-full text-green-500">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-green-400">Presença Confirmada</h3>
                                        <p className="text-xs text-green-500/70">Volte amanhã para mais XP!</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-500 text-sm">Feito ✓</span>
                            </div>
                        ) : (
                            // SE NÃO MARCOU: BOTÃO GRANDE PARA MARCAR
                            <form
                                action={async (formData) => {
                                    "use server"
                                    await marcarPresenca(formData)
                                }}
                                className="p-4"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="text-pink-500" size={18} />
                                    <span className="font-bold text-white">Está na igreja?</span>
                                </div>
                                <Button className="w-full bg-pink-600 hover:bg-pink-700 font-bold h-12 shadow-lg shadow-pink-900/20 animate-pulse">
                                    MARCAR PRESENÇA (+20 XP)
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* MENU RÁPIDO */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/aluno/licoes">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:border-blue-500 hover:text-blue-400">
                            <BookOpen size={24} className="text-blue-500"/>
                            <span className="font-bold">Lições</span>
                        </Button>
                    </Link>
                    <Link href="/aluno/quiz">
                        <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 bg-slate-900 border-slate-800 hover:border-pink-500 hover:text-pink-400">
                            <BrainCircuit size={24} className="text-pink-500"/>
                            <span className="font-bold">Quiz</span>
                        </Button>
                    </Link>
                </div>

                {/* LISTA DE HISTÓRICO */}
                <div>
                    <div className="flex justify-between items-center mb-4 mt-2">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <CalendarCheck size={18} className="text-violet-500"/>
                            Atividades Recentes
                        </h2>
                        <Link href="/aluno/ranking" className="text-xs text-violet-400 hover:underline">Ver Ranking</Link>
                    </div>

                    {presencas.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
                            <p>Nenhuma atividade recente.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {presencas.map((p) => (
                                <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-10 rounded-full ${p.type === 'EBD' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{p.type === 'EBD' ? 'Escola Bíblica' : 'Culto/Evento'}</h3>
                                            <p className="text-xs text-slate-400">
                                                {new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-green-400 font-bold text-sm">+ {p.type === 'EBD' ? '50' : '20'} XP</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}