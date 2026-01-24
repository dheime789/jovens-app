import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function QuizListPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    // --- CORREÇÃO AQUI ---
    // Removi o filtro "questions: { some: {} }"
    // Agora traz TODAS as lições publicadas, mesmo se der erro nas perguntas
    const licoes = await prisma.lesson.findMany({
        where: {
            isPublished: true,
        },
        include: {
            questions: true,
            _count: {
                select: { questions: true }
            }
        },
        orderBy: { date: 'desc' }
    });

    const respostasDoAluno = await prisma.quizResult.findMany({
        where: { userId: userId }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <Link href="/aluno"><Button variant="ghost" className="mb-4 text-slate-400">← Voltar</Button></Link>

            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <BrainCircuit className="text-pink-500"/> Quizzes Disponíveis
            </h1>
            <p className="text-slate-400 mb-8">Responda corretamente para ganhar XP!</p>

            <div className="space-y-4">
                {licoes.length === 0 ? (
                    <div className="text-center py-10 bg-slate-900 rounded-xl border border-slate-800">
                        <BrainCircuit className="mx-auto text-slate-600 mb-2" size={40} />
                        <p className="text-slate-500">Nenhum quiz encontrado.</p>
                        <p className="text-xs text-slate-600 mt-1">Peça para o professor publicar uma aula.</p>
                    </div>
                ) : (
                    licoes.map((licao) => {
                        const qtdPerguntas = licao._count.questions;
                        const jaFez = respostasDoAluno.some(r => licao.questions.some(q => q.id === r.questionId));

                        return (
                            <div key={licao.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center group hover:border-pink-500 transition-colors">
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">{licao.title}</h3>

                                    {/* Mostra aviso se tiver 0 perguntas */}
                                    {qtdPerguntas === 0 ? (
                                        <p className="text-yellow-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertTriangle size={12}/> Erro: Sem perguntas cadastradas
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 text-xs mt-1">
                                            {qtdPerguntas} Perguntas • {qtdPerguntas * 50} XP Possíveis
                                        </p>
                                    )}

                                    {jaFez && <span className="text-green-500 text-xs flex items-center gap-1 mt-2"><CheckCircle2 size={12}/> Você já participou</span>}
                                </div>

                                {qtdPerguntas === 0 ? (
                                    <Button disabled variant="secondary" className="opacity-50 cursor-not-allowed">Indisponível</Button>
                                ) : jaFez ? (
                                    <Button disabled variant="secondary" className="opacity-50">Feito</Button>
                                ) : (
                                    <Link href={`/aluno/quiz/${licao.id}`}>
                                        <Button className="bg-pink-600 hover:bg-pink-700">Jogar <ChevronRight size={16}/></Button>
                                    </Link>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}