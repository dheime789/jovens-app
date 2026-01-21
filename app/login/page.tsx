import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";

export default async function LoginPage() {

    // --- AÇÃO: FAZER LOGIN (SALVAR COOKIE) ---
    async function login(formData: FormData) {
        "use server";
        const userId = formData.get("userId") as string;

        // Salva o ID do usuário no navegador (cookie) por 7 dias
        const cookieStore = await cookies();
        cookieStore.set("userId", userId);

        redirect("/");
    }

    // Busca todos os usuários para listar
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: { squad: true }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-violet-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <UserCircle size={40} className="text-violet-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Quem é você?</CardTitle>
                    <p className="text-slate-400">Selecione seu perfil para entrar.</p>
                </CardHeader>
                <CardContent>

                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {users.map((user) => (
                            <form key={user.id} action={login}>
                                <input type="hidden" name="userId" value={user.id} />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full justify-between py-6 border-slate-700 bg-slate-950 text-white hover:bg-violet-600 hover:text-white hover:border-violet-500 group"
                                >
                                    <span className="font-bold">{user.name}</span>
                                    <span className="text-xs text-slate-500 group-hover:text-violet-200">
                    {user.squad?.name || "Sem Tribo"}
                  </span>
                                </Button>
                            </form>
                        ))}

                        {users.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-4">Nenhum jovem encontrado.</p>
                                <a href="/cadastro">
                                    <Button className="w-full bg-blue-600">Criar Primeira Conta</Button>
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                        <a href="/cadastro" className="text-sm text-violet-400 hover:underline">
                            Não está na lista? Cadastre-se aqui.
                        </a>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}