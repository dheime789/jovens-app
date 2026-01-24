import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { QuizGameClient } from "./quiz-client";

export default async function QuizPage({
                                           params,
                                       }: {
    params: Promise<{ lessonId: string }>
}) {
    const { lessonId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;

    if (!userId) redirect("/login");

    const licao = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { questions: true }
    });

    if (!licao || licao.questions.length === 0) {
        return <div className="text-white p-6">Erro: Quiz não encontrado ou sem perguntas.</div>;
    }

    const jaFez = await prisma.quizResult.findFirst({
        where: {
            userId: userId,
            question: { lessonId: lessonId }
        }
    });

    return (
        <QuizGameClient
            lessonTitle={licao.title}
            questions={licao.questions}
            lessonId={lessonId}
            jaFez={!!jaFez}
        />
    );
}