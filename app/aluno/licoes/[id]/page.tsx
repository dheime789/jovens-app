import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle, ChevronLeft, Calendar } from "lucide-react";
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

    // Verifica se já leu (usamos o attendance ou um campo novo,
    // mas para simplificar vamos usar um cookie ou apenas mostrar o botão sem travar XP por enquanto
    // ou criar um registro simples de atividade no futuro).
    // Para agora: Botão visual de concluir.

    async function concluirLeitura() {
        "use server";
        const c = await cookies();
        const uid = c.get("aluno_logado")?.value;
        if(!uid) return;

        // Dá 10 XP pela leitura (se quiser limitar 1x por lição, precisaria de tabela nova)
        // Aqui vamos dar o XP direto para incentivar
        await prisma.user.update({
            where: { id: uid },
            data: { xp: { increment: 10 } }
        });

        revalidatePath("/aluno");
        redirect("/aluno/licoes?sucesso=leitura");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            {/* Botão Voltar */}
            <Link href="/aluno/licoes" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
                <ChevronLeft size={20} /> Voltar para lista
            </Link>

            <article className="max-w-2xl mx-auto">
                {/* Cabeçalho da Lição */}
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

                {/* Conteúdo do Texto */}
                <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {licao.content}
                </div>

                {/* Botão de Conclusão */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="bg-slate-900 rounded-xl p-6 text-center border border-slate-800">
                        <h3 className="font-bold text-white mb-2">Terminou a leitura?</h3>
                        <p className="text-slate-400 text-sm mb-6">Marque como lido para garantir seus pontos de sabedoria.</p>

                        <form action={concluirLeitura}>
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 font-bold w-full md:w-auto">
                                <CheckCircle className="mr-2" size={20}/> CONCLUIR LEITURA (+10 XP)
                            </Button>
                        </form>
                    </div>
                </div>

            </article>
        </div>
    );
}