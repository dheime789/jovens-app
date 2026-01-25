"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    BookOpen,
    LogOut,
    PlusCircle,
    Search,
    Trash2,
    ShieldAlert,
    Pencil,
    Settings,
    AlertTriangle,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// --- IMPORTAÇÃO DIRETA ---
// Agora importamos a função "sincronizarTudo" em vez da antiga "corrigirXP"
import { reformularTribos, sincronizarTudo } from "./actions";

// --- TIPOS DE DADOS ---
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
                                            onExcluirAluno,
                                        }: DashboardProps) {

    const [abaAtiva, setAbaAtiva] = useState("visao-geral");
    const [termoBusca, setTermoBusca] = useState("");
    const [loadingTribos, setLoadingTribos] = useState(false);

    const alunosFiltrados = alunos.filter(a =>
        a.name.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (a.squad?.name || "").toLowerCase().includes(termoBusca.toLowerCase())
    );

    // FUNÇÃO REFORMULAR TRIBOS
    const handleReformular = async () => {
        if (confirm("⚠️ PERIGO: Tem certeza? \n\nIsso apagará todas as tribos extras e manterá apenas Judá e Levi.")) {
            setLoadingTribos(true);
            try {
                await reformularTribos();
                alert("Sistema reformulado com sucesso!");
                window.location.reload();
            } catch (e) {
                alert("Erro ao reformular.");
            }
            setLoadingTribos(false);
        }
    };

    // FUNÇÃO SINCRONIZAR TUDO (NOVA)
    const handleSincronizar = async () => {
        if(confirm("Isso vai recalcular o XP e os Dias Seguidos de TODOS os alunos baseados no histórico de presença.\n\nÚtil para corrigir erros de cálculo ou bugs.\n\nDeseja continuar?")) {
            setLoadingTribos(true);
            try {
                const res = await sincronizarTudo(); // Chama a função poderosa
                alert(`Sincronização concluída!\n${res.count} alunos tiveram seus dados corrigidos.`);
                window.location.reload();
            } catch (e) {
                alert("Erro ao sincronizar.");
            }
            setLoadingTribos(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">

            {/* --- MENU LATERAL --- */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-white">
                        <ShieldAlert className="text-red-500" /> Admin Moriah
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Button variant={abaAtiva === "visao-geral" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "visao-geral" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("visao-geral")}>
                        <LayoutDashboard size={20} className="mr-3" /> Visão Geral
                    </Button>
                    <Button variant={abaAtiva === "alunos" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "alunos" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("alunos")}>
                        <Users size={20} className="mr-3" /> Alunos
                    </Button>
                    <Button variant={abaAtiva === "presenca" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "presenca" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("presenca")}>
                        <CalendarCheck size={20} className="mr-3" /> Presença
                    </Button>
                    <Button variant={abaAtiva === "licoes" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "licoes" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("licoes")}>
                        <BookOpen size={20} className="mr-3" /> Lições
                    </Button>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <p className="px-4 text-xs text-slate-500 font-bold mb-2 uppercase">Sistema</p>
                        <Button variant={abaAtiva === "config" ? "secondary" : "ghost"} className={`w-full justify-start ${abaAtiva === "config" ? "bg-slate-800 text-white" : "text-slate-400"}`} onClick={() => setAbaAtiva("config")}>
                            <Settings size={20} className="mr-3" /> Configurações
                        </Button>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="outline" className="w-full border-red-900/30 text-red-400 hover:bg-red-950 hover:text-red-300" onClick={onSair}>
                        <LogOut size={18} className="mr-2" /> Sair
                    </Button>
                </div>
            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="flex-1 bg-slate-950 p-6 overflow-auto">

                {/* MENU MOBILE */}
                <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { id: "visao-geral", label: "Geral" },
                        { id: "alunos", label: "Alunos" },
                        { id: "presenca", label: "Presença" },
                        { id: "licoes", label: "Lições" },
                        { id: "config", label: "Config" }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setAbaAtiva(item.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                                abaAtiva === item.id
                                    ? "bg-violet-600 text-white border border-violet-500"
                                    : "bg-slate-900 text-slate-400 border border-slate-800"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* 1. VISÃO GERAL */}
                {abaAtiva === "visao-geral" && (
                    <div className="space-y-6 animate-in fade-in duration-500">

                        {/* --- ALERTA DE AUSÊNCIA --- */}
                        {alunosAusentes && alunosAusentes.length > 0 && (
                            <Card className="bg-red-950/20 border-red-900/50 mb-6">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-red-400 flex items-center gap-2 text-lg">
                                        <AlertTriangle /> Radar de Ovelhas (Ausentes +15 dias)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {alunosAusentes.map(aluno => (
                                            <div key={aluno.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-white">{aluno.name}</p>
                                                    <p className="text-xs text-slate-400">
                                                        Última vez: {aluno.attendances && aluno.attendances.length > 0
                                                        ? new Date(aluno.attendances[0].date).toLocaleDateString('pt-BR')
                                                        : "Nunca veio"}
                                                    </p>
                                                </div>
                                                <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 rounded-full">
                                                    <MessageCircle size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400"> <Users size={24} /> </div>
                                    <div> <p className="text-slate-400 text-sm">Total de Jovens</p> <h3 className="text-2xl font-bold text-white">{totalAlunos}</h3> </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-400"> <CalendarCheck size={24} /> </div>
                                    <div> <p className="text-slate-400 text-sm">Presenças Hoje</p> <h3 className="text-2xl font-bold text-white">{presencasHoje}</h3> </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-violet-500/10 rounded-full flex items-center justify-center text-violet-400"> <BookOpen size={24} /> </div>
                                    <div> <p className="text-slate-400 text-sm">Lições Publicadas</p> <h3 className="text-2xl font-bold text-white">{licoes.length}</h3> </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 2. ALUNOS */}
                {abaAtiva === "alunos" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Gerenciar Alunos</h2>
                            <Link href="/cadastro" target="_blank">
                                <Button className="bg-blue-600 hover:bg-blue-700"> <PlusCircle size={18} className="mr-2" /> Novo Aluno </Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                            <Input placeholder="Buscar por nome ou tribo..." className="pl-10 bg-slate-900 border-slate-800 text-white" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
                        </div>

                        <Card className="bg-slate-900 border-slate-800">
                            <div className="max-h-[500px] overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50 sticky top-0">
                                    <tr>
                                        <th className="p-4">Nome</th>
                                        <th className="p-4">Tribo</th>
                                        <th className="p-4">Nível</th>
                                        <th className="p-4">XP</th>
                                        <th className="p-4 text-right">Ação</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {alunosFiltrados.map((aluno) => (
                                        <tr key={aluno.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="p-4 font-bold text-white">{aluno.name}</td>
                                            <td className="p-4 text-slate-300">{aluno.squad?.name || "-"}</td>
                                            <td className="p-4 text-violet-400 font-bold">Lvl {aluno.level}</td>
                                            <td className="p-4 text-slate-400">{aluno.xp}</td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="destructive" size="sm"
                                                    className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50"
                                                    onClick={() => {
                                                        if(confirm("Tem certeza? Isso apaga todo o histórico do aluno!")) {
                                                            onExcluirAluno(aluno.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* 3. PRESENÇA */}
                {abaAtiva === "presenca" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Registro de Presença</h2>
                        <Card className="bg-slate-900 border-slate-800">
                            <div className="max-h-[500px] overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50 sticky top-0">
                                    <tr> <th className="p-4">Aluno</th> <th className="p-4">Atividade</th> <th className="p-4">Data/Hora</th> <th className="p-4 text-right">Ação</th> </tr>
                                    </thead>
                                    <tbody>
                                    {presencas.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="p-4 font-bold text-white">{p.user.name}</td>
                                            <td className="p-4"> <span className={p.type === 'EBD' ? 'px-2 py-1 rounded text-xs font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20' : 'px-2 py-1 rounded text-xs font-bold border bg-purple-500/10 text-purple-400 border-purple-500/20'}> {p.type} </span> </td>
                                            <td className="p-4 text-slate-400"> {new Date(p.date).toLocaleDateString('pt-BR')} às {new Date(p.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})} </td>
                                            <td className="p-4 text-right"> <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0" onClick={() => onExcluirPresenca(p.id)}> <Trash2 size={16} /> </Button> </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* 4. LIÇÕES */}
                {abaAtiva === "licoes" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Lições & Estudos</h2>
                            <Link href="/professor/criar-licao"> <Button className="bg-violet-600 hover:bg-violet-700"> <PlusCircle size={18} className="mr-2" /> Nova Lição </Button> </Link>
                        </div>
                        <div className="grid gap-4">
                            {licoes.length === 0 ? <p className="text-slate-500 text-center py-10">Nenhuma lição criada ainda.</p> : licoes.map((licao) => (
                                <Card key={licao.id} className="bg-slate-900 border-slate-800 hover:border-violet-500/50 transition-colors">
                                    <CardContent className="p-6 flex justify-between items-center">
                                        <div> <h3 className="font-bold text-white text-lg">{licao.title}</h3> <p className="text-slate-400 text-sm"> {new Date(licao.date).toLocaleDateString('pt-BR')} • {Array.isArray(licao.questions) ? licao.questions.length : 0} Perguntas </p> </div>
                                        <div className="flex gap-2 items-center">
                                            <span className={licao.isPublished ? "px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-400" : "px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-400"}> {licao.isPublished ? "Publicado" : "Rascunho"} </span>
                                            <Link href={`/professor/editar-licao/${licao.id}`}>
                                                <Button size="sm" className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"> <Pencil size={14} className="mr-2" /> Editar </Button>
                                            </Link>
                                            <Button variant="destructive" size="sm" className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50" onClick={() => onExcluirLicao(licao.id)}> <Trash2 size={14} /> </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. CONFIGURAÇÕES (NOVA ABA) */}
                {abaAtiva === "config" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>

                        <div className="border border-red-800/30 bg-red-900/10 p-6 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5"> <ShieldAlert size={120} /> </div>
                            <h3 className="text-red-400 font-bold text-lg mb-2 flex items-center gap-2"> <ShieldAlert size={20}/> Zona de Perigo: Reformulação </h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-2xl leading-relaxed">
                                Esta ação irá <strong>excluir todas as tribos</strong> extras, mantendo apenas Judá 🦁 e Levi 🛡️.
                            </p>
                            <Button onClick={handleReformular} disabled={loadingTribos} className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-6 shadow-lg shadow-red-900/20">
                                {loadingTribos ? "Processando..." : "EXECUTAR REFORMULAÇÃO"}
                            </Button>
                        </div>

                        {/* --- BOTÃO DE SINCRONIZAÇÃO GERAL --- */}
                        <div className="border border-blue-800/30 bg-blue-900/10 p-6 rounded-xl mt-6 relative overflow-hidden">
                            <h3 className="text-blue-400 font-bold text-lg mb-2 flex items-center gap-2">
                                🔄 Sincronização Geral
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-2xl">
                                Detectou algum erro? Saldo negativo? Dias seguidos não contando?
                                <br/>
                                Este botão <strong>recalcula tudo do zero</strong> para todos os alunos com base nas presenças confirmadas.
                            </p>

                            <Button
                                onClick={handleSincronizar}
                                disabled={loadingTribos}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6"
                            >
                                {loadingTribos ? "Calculando..." : "SINCRONIZAR E CORRIGIR DADOS"}
                            </Button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}