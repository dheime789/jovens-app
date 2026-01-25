import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// --- A LINHA MÁGICA (Isso força a atualização sempre) ---
export const dynamic = "force-dynamic";

export default async function LicoesPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("aluno_logado")?.value;
    if (!userId) redirect("/login");

    // Busca o aluno para saber quais lições ele já fez
    const aluno = await prisma.user.findUnique({
        where: { id: userId },
        include: { lessonHistory: true }
    });

    if (!aluno) redirect("/login");

    // IDs das lições que ele já completou
    const licoesCompletas = aluno.lessonHistory.map(h => h.lessonId);

    // Busca TODAS as lições PUBLICADAS, ordenadas pela mais nova
    const licoes = await prisma.lesson.findMany({
        where: { isPublished: true }, // Só mostra as publicadas
        orderBy: { date: 'desc' }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <div className="max-w-md mx-auto space-y-6">

                <div className="flex items-center gap-4 mb-6">
                    <Link href="/aluno" className="text-slate-400 hover:text-white transition-colors">
                        ← Voltar
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="text-violet-500" />
                        Estudos Bíblicos
                    </h1>
                </div>

                {licoes.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                        <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
                        <h3 className="text-slate-400 font-bold">Nenhuma lição disponível</h3>
                        <p className="text-slate-500 text-sm mt-2">O professor ainda não publicou novos estudos.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {licoes.map((licao) => {
                            const jaFez = licoesCompletas.includes(licao.id);

                            return (
                                <Link key={licao.id} href={`/aluno/licoes/${licao.id}`} className="block">
                                    <Card className={`border-slate-800 transition-all hover:border-violet-500/50 ${jaFez ? 'bg-green-950/10 border-green-900/30 opacity-75' : 'bg-slate-900'}`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className={`text-lg font-bold ${jaFez ? 'text-green-400' : 'text-white'}`}>
                                                    {licao.title}
                                                </CardTitle>
                                                {jaFez && <CheckCircle2 className="text-green-500" size={20} />}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {new Date(licao.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                                                {/* Mostra um resumo ou texto fixo se não tiver descrição */}
                                                "Nesta lição, vamos aprender sobre..."
                                            </p>
                                            <Button
                                                className={`w-full ${jaFez ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                                            >
                                                {jaFez ? "Ler Novamente" : "Começar Estudo"}
                                                <ChevronRight size={16} className="ml-2" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}