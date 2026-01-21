import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removi as importações do Select que podiam dar erro
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function CadastroPage() {

    // Essa função roda no servidor
    async function cadastrarJovem(formData: FormData) {
        "use server";

        console.log("--- INICIANDO PROCESSO DE CADASTRO ---");

        const nome = formData.get("nome") as string;
        const telefone = formData.get("telefone") as string;
        const triboId = formData.get("tribo") as string;

        // 1. CAPTURAR O AVATAR ESCOLHIDO (Se não vier nada, define o padrão "1")
        const avatar = formData.get("avatar") as string || "1";

        console.log("1. Dados recebidos:", nome, telefone, triboId, avatar);

        try {
            // 2. SALVAMOS TUDO NO BANCO
            await prisma.user.create({
                data: {
                    name: nome,
                    phone: telefone,
                    squadId: triboId,
                    avatar: avatar,
                }
            });

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

                    <div className="space-y-2">
                        <Label className="text-slate-200">Escolha sua Tribo</Label>
                        {/* SUBSTITUI O SELECT POR HTML NATIVO (BLINDADO CONTRA ERROS) */}
                        <select
                            name="tribo"
                            required
                            defaultValue=""
                            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2"
                        >
                            <option value="" disabled>Selecione...</option>
                            <option value="tribo-juda">Tribo de Judá 🦁</option>
                            <option value="tribo-simeao">Tribo de Simeão ⚔️</option>
                            <option value="tribo-naftali">Tribo de Naftali 🦌</option>
                            <option value="tribo-benjamim">Tribo de Benjamim 🐺</option>
                            <option value="tribo-levi">Tribo de Levi 🛡️</option>
                            <option value="tribo-ruben">Tribo de Rúben 🌊</option>
                        </select>
                    </div>

                    {/* --- SELEÇÃO DE AVATAR --- */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-slate-200">Escolha seu Avatar</Label>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: "1", emoji: "🧑" }, // Jovem Padrão
                                { id: "2", emoji: "🦁" }, // Leão
                                { id: "3", emoji: "🦅" }, // Águia
                                { id: "4", emoji: "👑" }, // Rei/Rainha
                                { id: "5", emoji: "🛡️" }, // Guerreiro
                                { id: "6", emoji: "🐑" }, // Ovelha
                                { id: "7", emoji: "🔥" }, // Profeta
                                { id: "8", emoji: "⚔️" }, // Soldado
                            ].map((av) => (
                                <label key={av.id} className="cursor-pointer relative group">
                                    <input
                                        type="radio"
                                        name="avatar"
                                        value={av.id}
                                        className="peer sr-only"
                                        defaultChecked={av.id === "1"}
                                    />
                                    <div className="h-14 w-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl border-2 border-slate-700
                                    peer-checked:border-violet-500 peer-checked:bg-violet-500/20 peer-checked:scale-110
                                    transition-all duration-200 hover:bg-slate-700 hover:border-slate-500 shadow-lg">
                                        {av.emoji}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-6 text-lg mt-4">
                        ENTRAR NA GUERRA 🔥
                    </Button>

                </form>
            </div>
        </div>
    );
}