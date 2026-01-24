import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardClient from "./DashboardClient";

export default async function ProfessorPage() {

    // 1. SEGURANÇA
    const cookieStore = await cookies();
    const isProfessor = cookieStore.get("professor_logado")?.value === "true";

    if (!isProfessor) {
        redirect("/admin-login");
    }

    // 2. BUSCAR DADOS
    const totalAlunos = await prisma.user.count({ where: { role: "JOVEM" } });

    const hojeStart = new Date();
    hojeStart.setHours(0,0,0,0);
    const presencasHoje = await prisma.attendance.count({
        where: { date: { gte: hojeStart } }
    });

    const alunos = await prisma.user.findMany({
        where: { role: "JOVEM" },
        orderBy: { name: 'asc' },
        include: { squad: true }
    });

    const presencas = await prisma.attendance.findMany({
        orderBy: { date: 'desc' },
        take: 50,
        include: { user: true }
    });

    const licoes = await prisma.lesson.findMany({
        orderBy: { date: 'desc' },
        include: { questions: true }
    });

    // --- AÇÕES DO SERVIDOR ---

    async function sair() {
        "use server";
        const c = await cookies();
        c.delete("professor_logado");
        redirect("/");
    }

    async function excluirPresenca(id: string) {
        "use server";
        const presenca = await prisma.attendance.findUnique({
            where: { id },
            include: { user: true }
        });

        if (presenca) {
            // Tira o XP do Aluno
            await prisma.user.update({
                where: { id: presenca.userId },
                data: { xp: { decrement: presenca.type === 'EBD' ? 50 : 20 } }
            });
            // Tira o XP da Tribo
            if (presenca.user.squadId) {
                await prisma.squad.update({
                    where: { id: presenca.user.squadId },
                    data: { totalXp: { decrement: presenca.type === 'EBD' ? 50 : 20 } }
                });
            }
            await prisma.attendance.delete({ where: { id } });
        }
        revalidatePath("/professor");
    }

    // --- ESSA É A FUNÇÃO ATUALIZADA E POTENTE ---
    async function excluirLicao(id: string) {
        "use server";

        // 1. Apaga o histórico de quem leu essa lição (Para não travar)
        try {
            await prisma.lessonHistory.deleteMany({
                where: { lessonId: id }
            });
        } catch (e) {
            // Ignora erro caso a tabela ainda não exista
        }

        // 2. Busca IDs das perguntas para apagar os resultados dos quizzes
        const perguntas = await prisma.question.findMany({
            where: { lessonId: id },
            select: { id: true }
        });

        const idsPerguntas = perguntas.map(p => p.id);

        // 3. Apaga resultados dos alunos nesses quizzes
        if (idsPerguntas.length > 0) {
            await prisma.quizResult.deleteMany({
                where: { questionId: { in: idsPerguntas } }
            });
        }

        // 4. Apaga as perguntas da lição
        await prisma.question.deleteMany({ where: { lessonId: id } });

        // 5. FINALMENTE: Apaga a lição
        await prisma.lesson.delete({ where: { id } });

        revalidatePath("/professor");
        revalidatePath("/aluno");
    }

    async function excluirAluno(id: string) {
        "use server";

        // 1. Apaga histórico de quiz
        await prisma.quizResult.deleteMany({ where: { userId: id } });

        // 2. Apaga presenças
        await prisma.attendance.deleteMany({ where: { userId: id } });

        // 3. Apaga notificações
        await prisma.notification.deleteMany({ where: { userId: id } });

        // 4. Apaga histórico de leitura (NOVO)
        try {
            await prisma.lessonHistory.deleteMany({ where: { userId: id } });
        } catch(e) {}

        // 5. Finalmente, apaga o aluno
        await prisma.user.delete({ where: { id } });

        revalidatePath("/professor");
    }

    return (
        <DashboardClient
            totalAlunos={totalAlunos}
            presencasHoje={presencasHoje}
            alunos={alunos}
            presencas={presencas}
            licoes={licoes}
            onSair={sair}
            onExcluirPresenca={excluirPresenca}
            onExcluirLicao={excluirLicao}
            onExcluirAluno={excluirAluno}
        />
    );
}