import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, ChevronLeft, Calendar, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export default async function LicaoDetalhePage({
                                                   params,
                                               }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;

    if (!userId) redirect("/login");

    const licao = await prisma.lesson.findUnique({
        where: { id },
    });

    if (!licao) {
        return <div className="text-white p-6">Lição não encontrada.</div>;
    }

    // --- TRAVA DE SEGURANÇA ---
    // Verifica se já leu essa lição específica
    const jaLeu = await prisma.lessonHistory.findUnique({
        where: {
            userId_lessonId: {
                userId: userId,
                lessonId: id
            }
        }
    });

    async function concluirLeitura() {
        "use server";
        const c = await cookies();
        const uid = c.get("aluno_logado")?.value;
        if(!uid) return;

        // Dupla checagem no servidor antes de dar XP
        const check = await prisma.lessonHistory.findUnique({
            where: { userId_lessonId: { userId: uid, lessonId: id } }
        });

        if (check) return; // Se já leu, para tudo e não dá XP!

        // 1. Registra que leu
        await prisma.lessonHistory.create({
            data: {
                userId: uid,
                lessonId: id
            }
        });

        // 2. Dá os 10 XP
        await prisma.user.update({
            where: { id: uid },
            data: { xp: { increment: 10 } }
        });

        revalidatePath("/aluno");
        redirect(`/aluno/licoes/${id}`); // Recarrega a página para atualizar o botão
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <Link href="/aluno/licoes" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
                <ChevronLeft size={20} /> Voltar para lista
            </Link>

            <article className="max-w-2xl mx-auto">
                {/* Cabeçalho */}
                <div className="mb-8 border-b border-slate-800 pb-6">
            <span className="inline-flex items-center gap-2 bg-violet-900/30 text-violet-300 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <BookOpen size={14} /> Estudo Bíblico
            </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white leading-tight">
                        {licao.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar size={16} />
                        {new Date(licao.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {licao.content}
                </div>

                {/* Botão de Conclusão (Com Trava Visual) */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className={`rounded-xl p-6 text-center border transition-all ${jaLeu ? "bg-slate-900/50 border-slate-800" : "bg-slate-900 border-slate-700"}`}>

                        {jaLeu ? (
                            // ESTADO: JÁ LIDO (Botão Bloqueado)
                            <div>
                                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="font-bold text-green-500 mb-2">Leitura Concluída!</h3>
                                <p className="text-slate-500 text-sm">Você já garantiu seus pontos de sabedoria nesta lição.</p>
                                <Button disabled className="mt-4 bg-slate-800 text-slate-400 font-bold w-full md:w-auto">
                                    XP JÁ RECEBIDO
                                </Button>
                            </div>
                        ) : (
                            // ESTADO: NÃO LIDO (Botão Verde)
                            <div>
                                <h3 className="font-bold text-white mb-2">Terminou a leitura?</h3>
                                <p className="text-slate-400 text-sm mb-6">Marque como lido para garantir seus pontos.</p>
                                <form action={concluirLeitura}>
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700 font-bold w-full md:w-auto shadow-lg shadow-green-900/20">
                                        <CheckCircle className="mr-2" size={20}/> CONCLUIR LEITURA (+10 XP)
                                    </Button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

            </article>
        </div>
    );
}