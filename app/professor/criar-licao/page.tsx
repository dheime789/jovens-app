import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// REMOVI O IMPORT DO 'Textarea' QUE DAVA ERRO
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function CriarLicaoPage() {

    async function criarLicao(formData: FormData) {
        "use server";

        const titulo = formData.get("titulo") as string;
        const conteudo = formData.get("conteudo") as string;

        // Cria a lição no banco
        await prisma.lesson.create({
            data: {
                title: titulo,
                content: conteudo,
                date: new Date(),
                isPublished: true // Já publica direto
            }
        });

        redirect("/professor");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">

            <div className="max-w-2xl mx-auto space-y-6">
                <Link href="/professor" className="flex items-center text-slate-400 hover:text-white mb-4">
                    <ArrowLeft size={20} className="mr-2" /> Voltar ao Painel
                </Link>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-white">Nova Lição / Estudo</CardTitle>
                        <p className="text-slate-400">Escreva o conteúdo que os jovens vão estudar.</p>
                    </CardHeader>
                    <CardContent>
                        <form action={criarLicao} className="space-y-6">

                            <div className="space-y-2">
                                <Label className="text-white">Título da Aula</Label>
                                <Input
                                    name="titulo"
                                    placeholder="Ex: A Vida de Davi"
                                    className="bg-slate-950 border-slate-800 text-white"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-white">Conteúdo do Estudo</Label>

                                {/* AQUI ESTÁ A CORREÇÃO: Usamos HTML nativo estilizado */}
                                <textarea
                                    name="conteudo"
                                    className="flex min-h-[300px] w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                    placeholder="Escreva aqui o texto bíblico, a explicação e a aplicação..."
                                    required
                                />
                            </div>

                            <Button className="w-full bg-green-600 hover:bg-green-700 font-bold py-6">
                                <Save size={20} className="mr-2" /> SALVAR E PUBLICAR
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}