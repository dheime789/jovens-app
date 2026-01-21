import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AdminLoginPage() {

    async function entrar(formData: FormData) {
        "use server";

        const senhaDigitada = formData.get("senha") as string;

        // --- SUA SENHA SECRETA AQUI ---
        // Você pode mudar "moria123" para o que quiser
        const senhaCorreta = "moria123";

        if (senhaDigitada === senhaCorreta) {
            // Se acertou, damos o crachá de acesso
            const cookieStore = await cookies();
            cookieStore.set("professor_logado", "true", {
                maxAge: 60 * 60 * 24 // Dura 24 horas
            });
            redirect("/professor");
        } else {
            // Se errou (simplesmente recarrega por enquanto)
            redirect("/admin-login?erro=true");
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} className="text-red-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Área Restrita</CardTitle>
                    <p className="text-slate-400 text-sm">Acesso exclusivo para líderes.</p>
                </CardHeader>
                <CardContent>
                    <form action={entrar} className="space-y-4">
                        <Input
                            type="password"
                            name="senha"
                            placeholder="Digite a Senha Mestra"
                            className="bg-slate-950 border-slate-700 text-white text-center"
                            required
                        />
                        <Button className="w-full bg-red-600 hover:bg-red-700 font-bold">
                            ACESSAR PAINEL
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}