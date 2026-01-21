import { requireUser } from "@/lib/auth"; // <--- AQUI A SEGURANÇA (Importamos o Auth)
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowLeft, HelpCircle, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function QuizPage() {

    // 1. CORREÇÃO: BLOQUEAR ACESSO SE NÃO TIVER LOGADO
    // (Antes pegava o último usuário, agora pega o LOGADO)
    const user = await requireUser();

    // 2. BUSCAR PERGUNTAS
    const perguntas = await prisma.question.findMany();

    if (perguntas.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={48} className="text-yellow-500 mb-4" />
                <h1 className="text-xl font-bold">Nenhuma pergunta encontrada</h1>
                <p className="text-slate-400 mt-2">O professor ainda não cadastrou o quiz de hoje.</p>
                <Link href="/">
                    <Button className="mt-6" variant="outline">Voltar</Button>
                </Link>
            </div>
        );
    }

    // 3. SORTEAR PERGUNTA DO DIA
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const indiceDoDia = diaDoAno % perguntas.length;
    const perguntaDoDia = perguntas[indiceDoDia];

    // 4. VERIFICAR SE O *USUÁRIO LOGADO* JÁ RESPONDEU
    const hojeStart = new Date();
    hojeStart.setHours(0, 0, 0, 0);

    const quizRealizado = await prisma.attendance.findFirst({
        where: { userId: user.id, type: "QUIZ", date: { gte: hojeStart } }
    });

    // --- AÇÃO: RESPONDER ---
    async function responderQuiz(formData: FormData) {
        "use server";
        const respostaEscolhida = formData.get("resposta") as string;
        const perguntaCorreta = formData.get("gabarito") as string;

        if (respostaEscolhida !== perguntaCorreta) return;

        // CORREÇÃO: Busca usuário logado seguro novamente para salvar
        const dbUser = await requireUser();

        // Salva Presença
        await prisma.attendance.create({
            data: { userId: dbUser.id, type: "QUIZ" }
        });

        // Ponto pro Jovem
        await prisma.user.update({
            where: { id: dbUser.id },
            data: { xp: { increment: 20 }, lastActivity: new Date() }
        });

        // Ponto pra Tribo
        if (dbUser.squadId) {
            await prisma.squad.update({
                where: { id: dbUser.squadId },
                data: { totalXp: { increment: 20 } }
            });
        }

        revalidatePath("/quiz");
        revalidatePath("/");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
            <Link href="/" className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2">
                <ArrowLeft size={20} /> Voltar
            </Link>

            <div className="max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <div className="h-20 w-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto text-violet-400 mb-4 animate-pulse">
                        <HelpCircle size={40} />
                    </div>
                    <h1 className="text-2xl font-bold">Quiz Bíblico</h1>

                    {/* Mostra o nome de quem está respondendo para confirmar */}
                    <p className="text-slate-400 text-sm">Respondendo como: <span className="text-violet-400 font-bold">{user.name}</span></p>
                </div>

                {quizRealizado ? (
                    <Card className="bg-green-900/20 border-green-500/50 border animate-in zoom-in duration-300">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                            <Trophy size={64} className="text-yellow-400 animate-bounce" />
                            <div>
                                <h2 className="text-xl font-bold text-green-400">Mandou Bem!</h2>
                                <p className="text-slate-300">Você já pontuou hoje.</p>
                            </div>
                            <Link href="/" className="w-full">
                                <Button className="w-full bg-green-600 hover:bg-green-700 font-bold">Voltar ao Início</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-900 border-slate-800 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-violet-400 bg-violet-400/10 px-2 py-1 rounded">PERGUNTA DO DIA</span>
                                <Calendar size={14} className="text-slate-500" />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-6 leading-relaxed">{perguntaDoDia.text}</h2>

                            <form action={responderQuiz} className="space-y-3">
                                <input type="hidden" name="gabarito" value={perguntaDoDia.correctOption} />

                                {[perguntaDoDia.optionA, perguntaDoDia.optionB, perguntaDoDia.optionC, perguntaDoDia.optionD].map((opcao, index) => (
                                    <Button
                                        key={index} type="submit" name="resposta" value={opcao} variant="outline"
                                        className="w-full justify-start text-left h-auto py-4 text-white border-slate-700 bg-slate-800/50 hover:bg-violet-600 hover:border-violet-500 hover:text-white transition-all text-base"
                                    >
                                        {opcao}
                                    </Button>
                                ))}
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}