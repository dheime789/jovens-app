import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditarLicaoClient from "./EditarLicaoClient"; // <--- É ISSO QUE CHAMA A TELA NOVA

export default async function EditarLicaoPage({ params }: { params: Promise<{ id: string }> }) {

    // 1. Pega o ID da URL
    const { id } = await params;

    // 2. Busca a lição e as perguntas no banco
    const licao = await prisma.lesson.findUnique({
        where: { id },
        include: {
            questions: {
                orderBy: { title: 'asc' }
            }
        }
    });

    // 3. Se não achar, volta pro painel
    if (!licao) {
        redirect("/professor");
    }

    // 4. ENTREGUE OS DADOS PARA O NOVO EDITOR
    return <EditarLicaoClient licao={licao} />;
}