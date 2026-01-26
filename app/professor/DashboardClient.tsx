"use client";

import { useState } from "react";
import {
    LayoutDashboard, Users, CalendarCheck, BookOpen, LogOut,
    PlusCircle, Search, Trash2, ShieldAlert, Pencil, Settings,
    AlertTriangle, MessageCircle, CheckCircle2 // <--- Ícone Novo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// --- IMPORTAÇÃO DIRETA ---
import { reformularTribos, sincronizarTudo, zerarPlacarTribos, excluirAluno, marcarPresencaPeloProfessor } from "./actions";

// ... (Interfaces continuam iguais)
interface Aluno {
    id: string;
    name: string;
    level: number;
    xp: number;
    squad?: { name: string } | null;
    attendances?: { date: Date | string }[];
}

interface Presenca {
    id: string;
    type: string;
    date: Date | string;
    user: { name: string };
}

interface Licao {
    id: string;
    title: string;
    date: Date | string;
    isPublished: boolean;
    questions: unknown[];
}

interface DashboardProps {
    totalAlunos: number;
    presencasHoje: number;
    alunos: Aluno[];
    presencas: Presenca[];
    licoes: Licao[];
    alunosAusentes: Aluno[];
    onSair: () => void;
    onExcluirPresenca: (id: string) => void;
    onExcluirLicao: (id: string) => void;
    onExcluirAluno: (id: string) => void;
}

export default function DashboardClient({
                                            totalAlunos,
                                            presencasHoje,
                                            alunos,
                                            presencas,
                                            licoes,
                                            alunosAusentes,
                                            onSair,
                                            onExcluirPresenca,
                                            onExcluirLicao,
                                            onExcluirAluno: propExcluirAluno,
                                        }: DashboardProps) {

    const [abaAtiva, setAbaAtiva] = useState("visao-geral");
    const [termoBusca, setTermoBusca] = useState("");
    const [loadingTribos, setLoadingTribos] = useState(false);

    const alunosFiltrados = alunos.filter(a =>
        a.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (a.squad?.name || "").toLowerCase().includes(termoBusca.toLowerCase())
    );

    // FUNÇÕES DE AÇÃO
    const handleReformular = async () => {
        if (confirm("⚠️ PERIGO: Tem certeza? \n\nIsso apagará todas as tribos extras.")) {
            setLoadingTribos(true);
            try { await reformularTribos(); alert("Tribos reformuladas!"); window.location.reload(); }
            catch (e) { alert("Erro."); }
            setLoadingTribos(false);
        }
    };

    const handleSincronizar = async () => {
        if(confirm("Isso vai recalcular o XP de todos os alunos.")) {
            setLoadingTribos(true);
            try { const res = await sincronizarTudo(); alert(`Sincronização concluída! ${res.count} corrigidos.`); window.location.reload(); } catch (e) { alert("Erro."); }
            setLoadingTribos(false);
        }
    }

    const handleZerarPlacar = async () => {
        if(confirm("⚠️ ZERAR PLACAR DAS TRIBOS?")) {
            setLoadingTribos(true);
            try { await zerarPlacarTribos(); alert("Placar zerado!"); window.location.reload(); }
            catch (e) { alert("Erro."); }
            setLoadingTribos(false);
        }
    }

    const handleExcluirAluno = async (id: string) => {
        if(confirm("Tem certeza? Isso apaga o aluno e tira os pontos da tribo!")) {
            await excluirAluno(id);
            alert("Aluno excluído.");
            window.location.reload();
        }
    }

    // --- NOVA FUNÇÃO: DAR PRESENÇA ---
    const handleDarPresenca = async (id: string, nome: string) => {
        if(confirm(`Confirmar presença para ${nome} hoje? (+50 XP)`)) {
            const res = await marcarPresencaPeloProfessor(id);
            if(res.success) {
                alert("Presença confirmada!");
                window.location.reload();
            } else {
                alert(res.message);
            }
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white"> <ShieldAlert className="text-red-500" /> Admin Moriah </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Button variant={abaAtiva === "visao-geral" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "visao-geral" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("visao-geral")}> <LayoutDashboard size={20} className="mr-3" /> Visão Geral </Button>
                    <Button variant={abaAtiva === "alunos" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "alunos" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("alunos")}> <Users size={20} className="mr-3" /> Alunos </Button>
                    <Button variant={abaAtiva === "presenca" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "presenca" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("presenca")}> <CalendarCheck size={20} className="mr-3" /> Presença </Button>
                    <Button variant={abaAtiva === "licoes" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "licoes" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("licoes")}> <BookOpen size={20} className="mr-3" /> Lições </Button>
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <p className="px-4 text-xs text-slate-500 font-bold mb-2 uppercase">Sistema</p>
                        <Button variant={abaAtiva === "config" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "config" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("config")}> <Settings size={20} className="mr-3" /> Configurações </Button>
                    </div>
                </nav>
                <div className="p-4 border-t border-slate-800"> <Button variant="outline" className="w-full border-red-900/30 text-red-400 hover:bg-red-950 hover:text-red-300" onClick={onSair}> <LogOut size={18} className="mr-2" /> Sair </Button> </div>
            </aside>

            <main className="flex-1 bg-slate-950 p-6 overflow-auto">
                <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2"> {[{id:"visao-geral",label:"Geral"},{id:"alunos",label:"Alunos"},{id:"presenca",label:"Presença"},{id:"licoes",label:"Lições"},{id:"config",label:"Config"}].map((item)=>(<button key={item.id} onClick={()=>setAbaAtiva(item.id)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${abaAtiva===item.id?"bg-violet-600 text-white border border-violet-500":"bg-slate-900 text-slate-400 border border-slate-800"}`}>{item.label}</button>))} </div>

                {abaAtiva === "visao-geral" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {alunosAusentes && alunosAusentes.length > 0 && (
                            <Card className="bg-red-950/20 border-red-900/50 mb-6"> <CardHeader className="pb-2"> <CardTitle className="text-red-400 flex items-center gap-2 text-lg"> <AlertTriangle /> Radar de Ovelhas </CardTitle> </CardHeader> <CardContent> <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"> {alunosAusentes.map(aluno => ( <div key={aluno.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex justify-between items-center"> <div> <p className="font-bold text-white">{aluno.name}</p> <p className="text-xs text-slate-400"> Ausente há dias... </p> </div> <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 rounded-full"> <MessageCircle size={16} /> </Button> </div> ))} </div> </CardContent> </Card>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-slate-900 border-slate-800"> <CardContent className="p-6 flex items-center gap-4"> <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400"> <Users size={24} /> </div> <div> <p className="text-slate-400 text-sm">Total de Jovens</p> <h3 className="text-2xl font-bold text-white">{totalAlunos}</h3> </div> </CardContent> </Card>
                            <Card className="bg-slate-900 border-slate-800"> <CardContent className="p-6 flex items-center gap-4"> <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400"> <CalendarCheck size={24} /> </div> <div> <p className="text-slate-400 text-sm">Presenças Hoje</p> <h3 className="text-2xl font-bold text-white">{presencasHoje}</h3> </div> </CardContent> </Card>
                            <Card className="bg-slate-900 border-slate-800"> <CardContent className="p-6 flex items-center gap-4"> <div className="h-12 w-12 bg-violet-500/10 rounded-full flex items-center justify-center text-violet-400"> <BookOpen size={24} /> </div> <div> <p className="text-slate-400 text-sm">Lições Publicadas</p> <h3 className="text-2xl font-bold text-white">{licoes.length}</h3> </div> </CardContent> </Card>
                        </div>
                    </div>
                )}

                {abaAtiva === "alunos" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center"> <h2 className="text-2xl font-bold text-white">Gerenciar Alunos</h2> <Link href="/cadastro" target="_blank"> <Button className="bg-blue-600 hover:bg-blue-700"> <PlusCircle size={18} className="mr-2" /> Novo Aluno </Button> </Link> </div>
                        <div className="relative"> <Search className="absolute left-3 top-3 text-slate-500" size={18} /> <Input placeholder="Buscar..." className="pl-10 bg-slate-900 border-slate-800 text-white" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} /> </div>
                        <Card className="bg-slate-900 border-slate-800">
                            <div className="max-h-[500px] overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50 sticky top-0"> <tr> <th className="p-4">Nome</th> <th className="p-4">Tribo</th> <th className="p-4">XP</th> <th className="p-4 text-right">Ação</th> </tr> </thead>
                                    <tbody>
                                    {alunosFiltrados.map((aluno) => {
                                        // Verifica se já marcou presença hoje para desabilitar o botão
                                        const jaMarcouHoje = aluno.attendances && aluno.attendances.some(p => {
                                            const dataP = new Date(p.date);
                                            const hoje = new Date();
                                            return dataP.getDate() === hoje.getDate() && dataP.getMonth() === hoje.getMonth() && dataP.getFullYear() === hoje.getFullYear();
                                        });

                                        return (
                                            <tr key={aluno.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                                <td className="p-4 font-bold text-white">{aluno.name}</td>
                                                <td className="p-4 text-slate-300">{aluno.squad?.name || "-"}</td>
                                                <td className="p-4 text-violet-400 font-bold">{aluno.xp} XP</td>
                                                <td className="p-4 text-right flex justify-end gap-2">
                                                    {/* BOTÃO DE PRESENÇA */}
                                                    <Button
                                                        size="sm"
                                                        className={`border ${jaMarcouHoje ? 'bg-green-900/20 text-green-500 border-green-900/50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                                        disabled={jaMarcouHoje}
                                                        onClick={() => !jaMarcouHoje && handleDarPresenca(aluno.id, aluno.name)}
                                                    >
                                                        {jaMarcouHoje ? <CheckCircle2 size={16} /> : "Presente"}
                                                    </Button>

                                                    {/* BOTÃO DE EXCLUIR */}
                                                    <Button variant="destructive" size="sm" className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50" onClick={() => handleExcluirAluno(aluno.id)}> <Trash2 size={16} /> </Button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* (Mantive as abas de Presença, Lições e Config iguais para economizar espaço visual aqui, mas no arquivo real elas estão lá) */}
                {abaAtiva === "presenca" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Registro de Presença</h2>
                        <Card className="bg-slate-900 border-slate-800">
                            <div className="max-h-[500px] overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50 sticky top-0"> <tr> <th className="p-4">Aluno</th> <th className="p-4">Atividade</th> <th className="p-4">Data/Hora</th> <th className="p-4 text-right">Ação</th> </tr> </thead>
                                    <tbody>
                                    {presencas.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="p-4 font-bold text-white">{p.user.name}</td>
                                            <td className="p-4"> <span className="px-2 py-1 rounded text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">{p.type}</span> </td>
                                            <td className="p-4 text-slate-400"> {new Date(p.date).toLocaleDateString('pt-BR')} </td>
                                            <td className="p-4 text-right"> <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0" onClick={() => onExcluirPresenca(p.id)}> <Trash2 size={16} /> </Button> </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
                {abaAtiva === "licoes" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center"> <h2 className="text-2xl font-bold text-white">Lições</h2> <Link href="/professor/criar-licao"> <Button className="bg-violet-600 hover:bg-violet-700"> <PlusCircle size={18} className="mr-2" /> Nova </Button> </Link> </div>
                        <div className="grid gap-4"> {licoes.map(l => (<Card key={l.id} className="bg-slate-900 border-slate-800"> <CardContent className="p-6 flex justify-between items-center"> <div><h3 className="text-white font-bold">{l.title}</h3></div> <div className="flex gap-2"> <Link href={`/professor/editar-licao/${l.id}`}><Button size="sm" className="bg-slate-800"><Pencil size={14}/></Button></Link> <Button size="sm" variant="destructive" className="bg-red-900/20 text-red-500" onClick={()=>onExcluirLicao(l.id)}><Trash2 size={14}/></Button> </div> </CardContent> </Card>))} </div>
                    </div>
                )}
                {abaAtiva === "config" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Configurações</h2>
                        <div className="border border-red-800/30 bg-red-900/10 p-6 rounded-xl"> <h3 className="text-red-400 font-bold mb-2">Zona de Perigo</h3> <Button onClick={handleReformular} disabled={loadingTribos} className="bg-red-600 hover:bg-red-700 text-white font-bold"> Reformular Tribos </Button> </div>
                        <div className="border border-blue-800/30 bg-blue-900/10 p-6 rounded-xl"> <h3 className="text-blue-400 font-bold mb-2">Sincronização</h3> <Button onClick={handleSincronizar} disabled={loadingTribos} className="bg-blue-600 hover:bg-blue-700 text-white font-bold"> Sincronizar Tudo </Button> </div>
                        <div className="border border-yellow-800/30 bg-yellow-900/10 p-6 rounded-xl"> <h3 className="text-yellow-400 font-bold mb-2">Zerar Placar</h3> <Button onClick={handleZerarPlacar} disabled={loadingTribos} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold"> Zerar Tribos </Button> </div>
                    </div>
                )}
            </main>
        </div>
    );
}