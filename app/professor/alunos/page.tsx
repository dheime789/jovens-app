import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removi o 'Select' importado que causava o erro
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function GerenciarAlunosPage() {

    // --- AÇÃO: MATRICULAR NOVO ALUNO ---
    async function matricularAluno(formData: FormData) {
        "use server";

        const nome = formData.get("nome") as string;
        const telefone = formData.get("telefone") as string;
        const triboId = formData.get("tribo") as string;

        if (!nome || !triboId) return;

        await prisma.user.create({
            data: {
                name: nome,
                phone: telefone,
                squadId: triboId,
                role: "JOVEM" // Define como aluno padrão
            }
        });

        revalidatePath("/professor/alunos");
    }

    // --- AÇÃO: REMOVER ALUNO (Caso alguém saia) ---
    async function removerAluno(formData: FormData) {
        "use server";
        const userId = formData.get("id") as string;

        // Apaga histórico primeiro para não dar erro de vínculo
        await prisma.attendance.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });

        revalidatePath("/professor/alunos");
    }

    // --- BUSCAR DADOS ---
    const alunos = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: { squad: true }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">

            {/* Voltar */}
            <Link href="/professor" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6">
                <ArrowLeft size={20} /> Voltar ao Painel
            </Link>

            <div className="flex flex-col md:flex-row gap-8">

                {/* --- FORMULÁRIO DE MATRÍCULA --- */}
                <div className="w-full md:w-1/3">
                    <Card className="bg-slate-900 border-slate-800 sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-violet-400">
                                <UserPlus /> Nova Matrícula
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={matricularAluno} className="space-y-4">

                                <div className="space-y-2">
                                    <Label>Nome do Aluno</Label>
                                    <Input name="nome" placeholder="Nome Completo" className="bg-slate-950 border-slate-700 text-white" required />
                                </div>

                                <div className="space-y-2">
                                    <Label>WhatsApp (Opcional)</Label>
                                    <Input name="telefone" placeholder="(00) 00000-0000" className="bg-slate-950 border-slate-700 text-white" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Tribo</Label>

                                    {/* --- CORREÇÃO AQUI: Usando <select> nativo do HTML --- */}
                                    <select
                                        name="tribo"
                                        required
                                        defaultValue=""
                                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="" disabled>Selecione a Tribo...</option>
                                        <option value="tribo-juda">Tribo de Judá 🦁</option>
                                        <option value="tribo-simeao">Tribo de Simeão ⚔️</option>
                                        <option value="tribo-naftali">Tribo de Naftali 🦌</option>
                                        <option value="tribo-benjamim">Tribo de Benjamim 🐺</option>
                                        <option value="tribo-levi">Tribo de Levi 🛡️</option>
                                        <option value="tribo-ruben">Tribo de Rúben 🌊</option>
                                    </select>
                                    {/* --- FIM DA CORREÇÃO --- */}
                                </div>

                                <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold">
                                    MATRICULAR AGORA
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* --- LISTA DE ALUNOS --- */}
                <div className="w-full md:w-2/3">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="text-slate-400" />
                        <h2 className="text-xl font-bold">Alunos Matriculados ({alunos.length})</h2>
                    </div>

                    <div className="grid gap-3">
                        {alunos.length === 0 ? (
                            <p className="text-slate-500 italic">Nenhum aluno matriculado ainda.</p>
                        ) : (
                            alunos.map((aluno) => (
                                <div key={aluno.id} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                            {aluno.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{aluno.name}</p>
                                            <p className="text-xs text-slate-400 flex gap-2">
                                                <span>{aluno.squad?.name || "Sem Tribo"}</span> •
                                                <span>Lvl {aluno.level}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <form action={removerAluno}>
                                        <input type="hidden" name="id" value={aluno.id} />
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                            <Trash2 size={18} />
                                        </Button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}