"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, PlusCircle, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { atualizarLicao } from "../../actions";
import { useRouter } from "next/navigation";

// 1. DEFININDO OS TIPOS (O segredo para acabar com os erros)
interface Question {
    id?: string;
    title: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
}

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string | null;
    description?: string | null;
    isPublished: boolean;
    questions: Question[];
}

export default function EditarLicaoClient({ licao }: { licao: Lesson }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Estados
    const [title, setTitle] = useState(licao.title);
    const [videoUrl, setVideoUrl] = useState(licao.videoUrl || "");
    const [description, setDescription] = useState(licao.description || "");
    const [isPublished, setIsPublished] = useState(licao.isPublished);

    const [questions, setQuestions] = useState<Question[]>(licao.questions || []);

    // Função de mudança segura
    const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
        const newQuestions = [...questions];
        // O TypeScript agora sabe que 'field' é uma chave válida de Question
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: `temp-${Date.now()}`, title: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A" }
        ]);
    };

    const removeQuestion = (index: number) => {
        if(confirm("Remover esta pergunta?")) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("id", licao.id);
        formData.append("title", title);
        formData.append("videoUrl", videoUrl);
        formData.append("description", description);
        if (isPublished) formData.append("isPublished", "on");

        formData.append("questions", JSON.stringify(questions));

        await atualizarLicao(formData);

        alert("Lição atualizada com sucesso!");
        router.push("/professor");
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <div className="max-w-3xl mx-auto space-y-6">

                <div className="flex items-center gap-4 mb-6">
                    <Link href="/professor">
                        <Button variant="ghost" className="text-slate-400"><ArrowLeft size={20} /></Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Editar Lição</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DADOS GERAIS */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Título da Lição</Label>
                                <Input required value={title} onChange={e => setTitle(e.target.value)} className="bg-slate-800 border-slate-700" />
                            </div>
                            <div>
                                <Label>Link do Vídeo (YouTube)</Label>
                                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="bg-slate-800 border-slate-700" />
                            </div>
                            <div>
                                <Label>Resumo / Texto Bíblico</Label>
                                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-slate-800 border-slate-700 h-24" />
                            </div>

                            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <Label className="flex flex-col cursor-pointer" htmlFor="publicar">
                                    <span className="font-bold text-white">Lição Publicada?</span>
                                    <span className="font-normal text-xs text-slate-400">Se desmarcado, fica visível apenas para você.</span>
                                </Label>
                                <input
                                    id="publicar"
                                    type="checkbox"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-6 h-6 accent-violet-500 cursor-pointer rounded"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PERGUNTAS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-violet-500"/> Perguntas ({questions.length})</h2>
                            <Button type="button" onClick={addQuestion} variant="outline" className="border-violet-500 text-violet-400 hover:bg-violet-950">
                                <PlusCircle size={18} className="mr-2"/> Adicionar Pergunta
                            </Button>
                        </div>

                        {questions.map((q, index) => (
                            <Card key={q.id || index} className="bg-slate-900 border-slate-800 relative">
                                <Button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-red-500 hover:bg-red-950/20 h-8 w-8 p-0"
                                >
                                    <Trash2 size={16}/>
                                </Button>

                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <Label className="text-violet-400">Pergunta #{index + 1}</Label>
                                        <Input
                                            required
                                            value={q.title}
                                            onChange={(e) => handleQuestionChange(index, 'title', e.target.value)}
                                            placeholder="Ex: Quem derrubou as muralhas?"
                                            className="bg-slate-800 border-slate-700 mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { key: 'optionA', label: 'Opção A' },
                                            { key: 'optionB', label: 'Opção B' },
                                            { key: 'optionC', label: 'Opção C' },
                                            { key: 'optionD', label: 'Opção D' }
                                        ].map((opt) => (
                                            <div key={opt.key}>
                                                <Label className="text-xs text-slate-500">{opt.label}</Label>
                                                <div className="flex items-center gap-2">
                                                    {/* Aqui removemos o 'any' usando keyof Question */}
                                                    <Input
                                                        required
                                                        value={q[opt.key as keyof Question] as string}
                                                        onChange={(e) => handleQuestionChange(index, opt.key as keyof Question, e.target.value)}
                                                        className={`bg-slate-800 border-slate-700 ${q.correctOption === opt.key.slice(-1) ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                                                    />
                                                    <input
                                                        type="radio"
                                                        name={`correct-${index}`}
                                                        checked={q.correctOption === opt.key.slice(-1)}
                                                        onChange={() => handleQuestionChange(index, 'correctOption', opt.key.slice(-1))}
                                                        className="w-4 h-4 accent-green-500 cursor-pointer"
                                                        title="Marcar como correta"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button disabled={loading} type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold shadow-lg shadow-green-900/20">
                        {loading ? "Salvando..." : "SALVAR ALTERAÇÕES"}
                    </Button>
                </form>
            </div>
        </div>
    );
}