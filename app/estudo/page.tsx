import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EstudoPage() {
    const user = await requireUser();

    // 1. BUSCAR A ÚLTIMA LIÇÃO PUBLICADA
    const licao = await prisma.lesson.findFirst({
        where: { isPublished: true },
        orderBy: { date: 'desc' },
        include: { questions: true } // Já traz as perguntas para sabermos quantas são
    });

    if (!licao) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <BookOpen size={48} className="text-slate-500 mb-4" />
                <h1 className="text-xl font-bold">Sem lição nova</h1>
                <p className="text-slate-400 mt-2">O professor está preparando o material da semana.</p>
                <Link href="/">
                    <Button className="mt-6" variant="outline">Voltar</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">

            {/* Topo */}
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
                <ArrowLeft size={20} /> Voltar
            </Link>

            <div className="max-w-2xl mx-auto space-y-8">

                {/* Cabeçalho da Lição */}
                <div className="text-center space-y-2">
            <span className="text-xs font-bold text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full uppercase tracking-wider">
                Estudo da Semana
            </span>
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        {licao.title}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {new Date(licao.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    </p>
                </div>

                {/* O CONTEÚDO (TEXTO) */}
                <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                    <CardContent className="p-6 md:p-8">
                        {/* 'whitespace-pre-wrap' faz o texto respeitar os parágrafos que você deu enter */}
                        <div className="prose prose-invert prose-lg max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {licao.content}
                        </div>
                    </CardContent>
                </Card>

                {/* Botão para ir pro Quiz */}
                <div className="bg-gradient-to-r from-violet-900/50 to-blue-900/50 p-6 rounded-2xl border border-white/10 text-center space-y-4">
                    <div className="mx-auto bg-white/10 w-12 h-12 rounded-full flex items-center justify-center">
                        <BrainCircuit size={24} className="text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Pronto para o Desafio?</h3>
                        <p className="text-slate-400 text-sm">
                            Responda {licao.questions.length} perguntas sobre esse estudo e ganhe XP.
                        </p>
                    </div>

                    <Link href={`/quiz?lessonId=${licao.id}`} className="block">
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black py-6 text-lg shadow-lg shadow-yellow-500/20">
                            COMEÇAR O QUIZ AGORA
                        </Button>
                    </Link>
                </div>

            </div>
        </div>
    );
}