"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, BookOpen, CheckCircle } from "lucide-react"; // Removi o 'Save' que não usava
import { criarLicaoComQuiz } from "./actions";

export default function CriarLicaoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [titulo, setTitulo] = useState("");
    const [conteudo, setConteudo] = useState("");

    const [perguntas, setPerguntas] = useState([
        { text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }
    ]);

    function addPergunta() {
        setPerguntas([...perguntas, { text: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }]);
    }

    function removePergunta(index: number) {
        const novas = perguntas.filter((_, i) => i !== index);
        setPerguntas(novas);
    }

    function updatePergunta(index: number, field: string, value: string) {
        const novas = [...perguntas];
        // @ts-expect-error: Ignorando tipagem estrita para simplificar o formulario dinamico
        novas[index][field] = value;
        setPerguntas(novas);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            await criarLicaoComQuiz({
                titulo,
                conteudo,
                perguntas
            });

            alert("Lição e Quiz criados com sucesso! 🚀");
            router.push("/professor");
        } catch { // Removi a variavel 'error' para não dar aviso
            alert("Erro ao criar lição. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BookOpen className="text-violet-500"/> Nova Lição + Quiz
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* DADOS DA LIÇÃO */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader><CardTitle>Conteúdo do Estudo</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400">Título da Lição</label>
                                <Input
                                    value={titulo} onChange={e => setTitulo(e.target.value)}
                                    placeholder="Ex: A Armadura de Deus" required
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Texto Bíblico / Explicação</label>
                                <Textarea
                                    value={conteudo} onChange={e => setConteudo(e.target.value)}
                                    placeholder="Escreva aqui o conteúdo da aula..." required
                                    className="bg-slate-950 border-slate-800 h-32 text-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PERGUNTAS DO QUIZ */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-300">Perguntas do Quiz</h2>

                        {perguntas.map((p, index) => (
                            <Card key={index} className="bg-slate-900 border-slate-800 relative">
                                <button type="button" onClick={() => removePergunta(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-400">
                                    <Trash size={18} />
                                </button>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-violet-400 font-bold text-sm">Pergunta {index + 1}</p>
                                    <Input
                                        placeholder="Ex: Quem derrubou Golias?"
                                        value={p.text} onChange={(e) => updatePergunta(index, 'text', e.target.value)}
                                        className="bg-slate-950 border-slate-800 text-white" required
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input placeholder="Opção A" value={p.optionA} onChange={e => updatePergunta(index, 'optionA', e.target.value)} className="bg-slate-950 border-slate-800 text-white" required />
                                        <Input placeholder="Opção B" value={p.optionB} onChange={e => updatePergunta(index, 'optionB', e.target.value)} className="bg-slate-950 border-slate-800 text-white" required />
                                        <Input placeholder="Opção C" value={p.optionC} onChange={e => updatePergunta(index, 'optionC', e.target.value)} className="bg-slate-950 border-slate-800 text-white" required />
                                        <Input placeholder="Opção D" value={p.optionD} onChange={e => updatePergunta(index, 'optionD', e.target.value)} className="bg-slate-950 border-slate-800 text-white" required />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Qual a correta?</label>
                                        <div className="flex gap-4">
                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                <label key={opt} className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer border ${p.correctOption === opt ? 'bg-green-900/30 border-green-500 text-green-400' : 'border-slate-800 text-slate-500'}`}>
                                                    <input
                                                        type="radio" name={`correct-${index}`}
                                                        checked={p.correctOption === opt}
                                                        onChange={() => updatePergunta(index, 'correctOption', opt)}
                                                        className="hidden"
                                                    />
                                                    <CheckCircle size={14} /> {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button type="button" onClick={addPergunta} variant="outline" className="w-full border-dashed border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                            <Plus size={16} className="mr-2"/> Adicionar outra pergunta
                        </Button>
                    </div>

                    <Button disabled={loading} type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold py-6 text-lg sticky bottom-4 shadow-xl shadow-violet-900/20">
                        {loading ? "Salvando..." : "PUBLICAR AULA E QUIZ"}
                    </Button>

                </form>
            </div>
        </div>
    );
}