import { prisma } from "@/lib/prisma";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Import Button

export default async function LicoesPage() {
    const licoes = await prisma.lesson.findMany({
        where: { isPublished: true },
        orderBy: { date: 'desc' }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/aluno"><Button variant="ghost" className="text-slate-400">← Voltar</Button></Link>
                <h1 className="text-xl font-bold flex items-center gap-2"><BookOpen className="text-blue-500"/> Estudos Bíblicos</h1>
            </div>

            <div className="grid gap-4">
                {licoes.length === 0 ? (
                    <p className="text-slate-500 text-center mt-10">Nenhum estudo disponível ainda.</p>
                ) : (
                    licoes.map((licao) => (
                        <Link key={licao.id} href={`/aluno/licoes/${licao.id}`} className="block group">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{licao.title}</h3>
                                        <p className="text-slate-400 text-xs mt-1">{new Date(licao.date).toLocaleDateString()}</p>
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-blue-500" />
                                </div>
                                <p className="text-slate-500 text-sm mt-3 line-clamp-2">{licao.content}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}