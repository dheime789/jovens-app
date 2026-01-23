import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { QuizGameClient } from "./quiz-client"; // Vamos criar esse componente logo abaixo

export default async function QuizPage({
                                           params,
                                       }: {
    params: Promise<{ lessonId: string }>
}) {
    const { lessonId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;

    if (!userId) redirect("/login");

    // Busca a lição e as perguntas
    const licao = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { questions: true }
    });

    if (!licao || licao.questions.length === 0) {
        return <div className="text-white p-6">Erro: Quiz não encontrado ou sem perguntas.</div>;
    }

    // Verifica se o aluno JÁ FEZ esse quiz
    const jaFez = await prisma.quizResult.findFirst({
        where: {
            userId: userId,
            question: { lessonId: lessonId }
        }
    });

    // Se já fez, manda de volta pra lista com aviso (opcional) ou deixa jogar sem valer ponto
    // Aqui vamos deixar jogar, mas o 'actions.ts' lá em cima já trava o XP extra.

    return (
        <QuizGameClient
            lessonTitle={licao.title}
            questions={licao.questions}
            lessonId={lessonId}
            jaFez={!!jaFez}
        />
    );
}