import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, CalendarCheck, Medal, Trophy } from "lucide-react"; // Adicionei Trophy que faltava
import Link from "next/link";

export default async function ProfessorPage() {

    // 1. BUSCAR O PLACAR DAS TRIBOS
    const tribos = await prisma.squad.findMany({
        orderBy: { totalXp: 'desc' }
    });

    // 2. BUSCAR AS ÚLTIMAS 20 PRESENÇAS
    const ultimasAtividades = await prisma.attendance.findMany({
        take: 20,
        orderBy: { date: 'desc' },
        include: {
            user: {
                include: { squad: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">

            {/* --- CABEÇALHO --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-violet-400 flex items-center gap-2">
                        <Users size={32} /> Painel do Professor
                    </h1>
                    <p className="text-slate-400">Visão geral da guerra espiritual.</p>
                </div>

                <Link href="/professor/conteudo">
                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold px-6 py-6 text-lg flex gap-2">
                        <PlusCircle /> ENVIAR PERGUNTA / LIÇÃO
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- 1. PLACAR DAS TRIBOS --- */}
                <Card className="bg-slate-900 border-slate-800 shadow-xl">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-yellow-400 flex items-center gap-2">
                            <Trophy /> Placar das Tribos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-800">
                            {tribos.map((tribo, index) => (
                                <div key={tribo.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition">
                                    <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl w-6 text-center ${index === 0 ? 'text-yellow-500 scale-125' : 'text-slate-500'}`}>
                      {index + 1}º
                    </span>
                                        <div>
                                            <p className="font-bold text-lg text-white">{tribo.name}</p>
                                            <p className="text-xs text-slate-400">Total de XP Acumulado</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                                        <Medal size={16} className="text-violet-500" />
                                        <span className="font-bold text-white">{tribo.totalXp} XP</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* --- 2. LISTA DE PRESENÇA --- */}
                <Card className="bg-slate-900 border-slate-800 shadow-xl h-fit">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-green-400 flex items-center gap-2">
                            <CalendarCheck /> Últimas Atividades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                        {ultimasAtividades.length === 0 ? (
                            <p className="p-6 text-center text-slate-500">Nenhuma atividade registrada ainda.</p>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {ultimasAtividades.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                                        <div>
                                            <p className="font-bold text-slate-200">{item.user.name}</p>

                                            {/* AQUI ESTAVA O PROBLEMA: Adicionei 'suppressHydrationWarning' */}
                                            <p className="text-xs text-slate-500 flex items-center gap-1" suppressHydrationWarning>
                                                {item.user.squad?.name || "Sem Tribo"} •
                                                {new Date(item.date).toLocaleDateString('pt-BR')} às {new Date(item.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>

                                        <span className={`text-xs font-bold px-2 py-1 rounded border 
                      ${item.type === 'QUIZ'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {item.type}
                    </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}