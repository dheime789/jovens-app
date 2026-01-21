import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function CadastroPage() {

    // Essa função roda no servidor
    async function cadastrarJovem(formData: FormData) {
        "use server";

        console.log("--- INICIANDO PROCESSO DE CADASTRO ---");

        const nome = formData.get("nome") as string;
        const telefone = formData.get("telefone") as string;

        // 1. AGORA CAPTURAMOS A TRIBO!
        const triboId = formData.get("tribo") as string;

        console.log("1. Dados recebidos:", nome, telefone, triboId);

        try {
            console.log("2. Tentando conectar ao Banco de Dados Neon...");

            // 2. SALVAMOS TUDO NO BANCO (Incluindo a Tribo)
            await prisma.user.create({
                data: {
                    name: nome,
                    phone: telefone,
                    squadId: triboId, // <--- AQUI ESTÁ A MÁGICA!
                }
            });

            console.log("3. SUCESSO! Usuário salvo com tribo.");

        } catch (erro) {
            console.error("❌ ERRO GRAVE AO SALVAR:", erro);
            return;
        }

        console.log("4. Redirecionando para a Home...");
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Junte-se à Tribo 🚀</h1>
                    <p className="text-slate-400">Crie sua conta para começar a ganhar XP</p>
                </div>

                <form action={cadastrarJovem} className="space-y-6">

                    <div className="space-y-2">
                        <Label htmlFor="nome" className="text-slate-200">Seu Nome Completo</Label>
                        <Input name="nome" placeholder="Ex: Davi O Valente" className="bg-slate-950 border-slate-800 text-white" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-slate-200">WhatsApp</Label>
                        <Input name="telefone" placeholder="(69) 99999-9999" className="bg-slate-950 border-slate-800 text-white" required />
                    </div>

                    {/* TRIBO - Agora corrigido (sem repetição de tags) */}
                    <div className="space-y-2">
                        <Label className="text-slate-200">Escolha sua Tribo</Label>
                        <Select name="tribo" required>
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>

                            {/* CORRIGIDO: Só um SelectContent */}
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                <SelectItem value="tribo-juda">Tribo de Judá 🦁</SelectItem>
                                <SelectItem value="tribo-simeao">Tribo de Simeão ⚔️</SelectItem>
                                <SelectItem value="tribo-naftali">Tribo de Naftali 🦌</SelectItem>
                                <SelectItem value="tribo-benjamim">Tribo de Benjamim 🐺</SelectItem>
                                <SelectItem value="tribo-levi">Tribo de Levi 🛡️</SelectItem>
                                <SelectItem value="tribo-ruben">Tribo de Rúben 🌊</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 text-lg">
                        ENTRAR NA GUERRA 🔥
                    </Button>

                </form>
            </div>
        </div>
    );
}