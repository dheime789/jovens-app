import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// REMOVI O TEXTAREA QUE DAVA ERRO
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function ConteudoPage() {

    // --- AÇÃO: CRIAR LIÇÃO ---
    async function criarLicao(formData: FormData) {
        "use server";
        const titulo = formData.get("titulo") as string;
        const texto = formData.get("texto") as string;

        await prisma.lesson.create({
            data: {
                title: titulo,
                content: texto,
                date: new Date(),
                isPublished: true
            }
        });
        revalidatePath("/professor/conteudo");
    }

    // --- AÇÃO: CRIAR PERGUNTA ---
    async function criarPergunta(formData: FormData) {
        "use server";
        const licaoId = formData.get("licaoId") as string;
        const texto = formData.get("pergunta") as string;
        const opA = formData.get("opA") as string;
        const opB = formData.get("opB") as string;
        const opC = formData.get("opC") as string;
        const opD = formData.get("opD") as string;
        const correta = formData.get("correta") as string;

        let lessonConnect = licaoId;
        if (!lessonConnect) {
            const lastLesson = await prisma.lesson.findFirst({ orderBy: { date: 'desc' }});
            if (lastLesson) lessonConnect = lastLesson.id;
            else {
                const newL = await prisma.lesson.create({ data: { title: "Geral", content: "Perguntas Gerais", date: new Date(), isPublished: true }});
                lessonConnect = newL.id;
            }
        }

        await prisma.question.create({
            data: {
                text: texto,
                optionA: opA,
                optionB: opB,
                optionC: opC,
                optionD: opD,
                correctOption: correta,
                lessonId: lessonConnect
            }
        });

        revalidatePath("/professor/conteudo");
    }

    const licoes = await prisma.lesson.findMany({ orderBy: { date: 'desc' }});

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <Link href="/professor" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6">
                <ArrowLeft size={20} /> Voltar ao Painel
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* --- 1. CRIAR NOVA LIÇÃO --- */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-blue-400 flex items-center gap-2">
                            <BookOpen /> Tema da Semana
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={criarLicao} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título da Lição</Label>
                                <Input name="titulo" placeholder="Ex: A Vida de José" className="bg-slate-950 border-slate-700 text-white" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Resumo / Versículo Chave</Label>
                                <Input name="texto" placeholder="Texto base..." className="bg-slate-950 border-slate-700 text-white" />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">Criar Lição</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* --- 2. ADICIONAR PERGUNTA --- */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                            <HelpCircle /> Nova Pergunta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={criarPergunta} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Vincular à Lição</Label>
                                <Select name="licaoId">
                                    <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                        <SelectValue placeholder="Selecione (ou deixe automático)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                        {licoes.map(l => (
                                            <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Pergunta</Label>
                                <Input name="pergunta" placeholder="Qual foi o..." className="bg-slate-950 border-slate-700 text-white" required />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Input name="opA" placeholder="Opção A" className="bg-slate-950 border-slate-700 text-white" required />
                                <Input name="opB" placeholder="Opção B" className="bg-slate-950 border-slate-700 text-white" required />
                                <Input name="opC" placeholder="Opção C" className="bg-slate-950 border-slate-700 text-white" required />
                                <Input name="opD" placeholder="Opção D" className="bg-slate-950 border-slate-700 text-white" required />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-yellow-400">Resposta Correta (Copie o texto exato)</Label>
                                <Input name="correta" placeholder="Cole aqui a resposta certa" className="bg-slate-950 border-yellow-500/30 text-white" required />
                            </div>

                            <Button className="w-full bg-green-600 hover:bg-green-700">Salvar Pergunta</Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}