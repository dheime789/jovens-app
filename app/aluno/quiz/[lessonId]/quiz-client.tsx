"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Trophy, ArrowRight, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { salvarResultado } from "./actions";

interface Question {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
}

export function QuizGameClient({
                                   lessonTitle,
                                   questions,
                                   lessonId,
                                   jaFez
                               }: {
    lessonTitle: string;
    questions: Question[];
    lessonId: string;
    jaFez: boolean;
}) {
    const router = useRouter();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [saving, setSaving] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    async function handleOptionClick(option: string) {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        if (option === currentQuestion.correctOption) {
            setScore(score + 1);
        }
    }

    async function handleNext() {
        if (isLastQuestion) {
            setGameFinished(true);
            setSaving(true);
            // Salva no banco
            if (!jaFez) {
                // Calcula pontuação final considerando a última resposta
                const finalScore = score + (selectedOption === currentQuestion.correctOption ? 0 : 0);
                await salvarResultado(lessonId, finalScore, questions.length);
            }
            setSaving(false);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        }
    }

    if (gameFinished) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
                <Card className="bg-slate-900 border-slate-800 w-full max-w-md text-center">
                    <CardContent className="p-8 space-y-6">
                        <div className="mx-auto w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 mb-4 animate-bounce">
                            <Trophy size={48} />
                        </div>

                        <h2 className="text-3xl font-bold text-white">Quiz Finalizado!</h2>

                        <div className="space-y-2">
                            <p className="text-slate-400">Você acertou</p>
                            <p className="text-5xl font-black text-violet-500">{score} <span className="text-xl text-slate-500">/ {questions.length}</span></p>
                        </div>

                        {jaFez ? (
                            <div className="bg-slate-800 p-3 rounded text-sm text-yellow-400">
                                Você já jogou, XP não contado desta vez.
                            </div>
                        ) : (
                            <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-xl">
                                <p className="font-bold text-green-400 text-lg">+ {score * 50} XP GANHOS</p>
                            </div>
                        )}

                        <Button onClick={() => router.push("/aluno/quiz")} className="w-full bg-violet-600 hover:bg-violet-700 font-bold">
                            Voltar para Lista
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 flex flex-col">
            <div className="mb-8">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
                    <span>{lessonTitle}</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="mb-8 text-center">
                    <div className="inline-block p-3 bg-violet-900/20 rounded-full text-violet-400 mb-4">
                        <BrainCircuit size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">{currentQuestion.text}</h2>
                </div>

                <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((opt) => {
                        // @ts-ignore
                        const text = currentQuestion[`option${opt}`];
                        let btnClass = "bg-slate-900 border-slate-800 hover:bg-slate-800 text-left justify-start h-auto py-4 text-white";

                        if (isAnswered) {
                            if (opt === currentQuestion.correctOption) {
                                btnClass = "bg-green-600 border-green-600 text-white hover:bg-green-600";
                            } else if (opt === selectedOption && selectedOption !== currentQuestion.correctOption) {
                                btnClass = "bg-red-600 border-red-600 text-white hover:bg-red-600";
                            } else {
                                btnClass = "bg-slate-900 border-slate-800 opacity-50";
                            }
                        }

                        return (
                            <Button key={opt} disabled={isAnswered} onClick={() => handleOptionClick(opt)} variant="outline" className={`w-full text-lg ${btnClass} transition-all duration-300`}>
                                <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center mr-3 text-sm font-bold shrink-0">{opt}</span>
                                <span className="whitespace-normal leading-tight">{text}</span>
                                {isAnswered && opt === currentQuestion.correctOption && <CheckCircle className="ml-auto text-white" />}
                                {isAnswered && opt === selectedOption && opt !== currentQuestion.correctOption && <XCircle className="ml-auto text-white" />}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {isAnswered && (
                <div className="fixed bottom-6 left-0 right-0 p-6 flex justify-center animate-in slide-in-from-bottom-5">
                    <Button onClick={handleNext} size="lg" className="w-full max-w-md bg-white text-slate-900 hover:bg-slate-200 font-bold shadow-xl">
                        {isLastQuestion ? "Finalizar Quiz" : "Próxima Pergunta"} <ArrowRight className="ml-2" />
                    </Button>
                </div>
            )}
        </div>
    );
}