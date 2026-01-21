import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

// Página dinâmica: recebe o ID pela URL
export default async function EditarLicaoPage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    // 1. Busca os dados atuais da lição
    const licao = await prisma.lesson.findUnique({
        where: { id }
    });

    if (!licao) {
        return <div className="text-white p-10">Lição não encontrada.</div>;
    }

    // 2. Ação de Atualizar
    async function atualizarLicao(formData: FormData) {
        "use server";

        const titulo = formData.get("titulo") as string;
        const conteudo = formData.get("conteudo") as string;

        await prisma.lesson.update({
            where: { id },
            data: {
                title: titulo,
                content: conteudo,
                // isPublished: true (Se quiser mudar o status, pode adicionar um checkbox depois)
            }
        });

        redirect("/professor");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/professor" className="flex items-center text-slate-400 hover:text-white mb-4">
                    <ArrowLeft size={20} className="mr-2" /> Cancelar e Voltar
                </Link>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Editar Lição</CardTitle>
                        <p className="text-slate-400">Corrija ou melhore o conteúdo.</p>
                    </CardHeader>
                    <CardContent>
                        <form action={atualizarLicao} className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-white">Título da Aula</Label>
                                <Input
                                    name="titulo"
                                    defaultValue={licao.title} // <--- PREENCHE SOZINHO
                                    className="bg-slate-950 border-slate-800 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Conteúdo do Estudo</Label>
                                <textarea
                                    name="conteudo"
                                    defaultValue={licao.content} // <--- PREENCHE SOZINHO
                                    className="flex min-h-[300px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                    required
                                />
                            </div>

                            <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-6">
                                <Save size={20} className="mr-2" /> SALVAR ALTERAÇÕES
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}