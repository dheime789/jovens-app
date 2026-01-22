import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function StudentLoginPage() {

    async function loginAluno(formData: FormData) {
        "use server";

        // Pega o que o aluno digitou (pode ser nome ou email/telefone, depende do seu cadastro)
        const emailOuNome = formData.get("email");

        // Busca no banco de dados
        const aluno = await prisma.user.findFirst({
            where: {
                // AQUI É O TRUQUE: Procura pelo email digitado
                email: emailOuNome as string,
            }
        });

        if (aluno) {
            // ACHOU! Salva o cookie e deixa entrar
            const c = await cookies();
            c.set("aluno_logado", aluno.id, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 30 // Fica logado por 30 dias
            });

            // Manda para a página inicial do aluno (crie essa página se não tiver!)
            redirect("/aluno");
        } else {
            // Não achou
            redirect("/login?erro=nao_encontrado");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-8 h-8 text-violet-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Acesso do Jovem</CardTitle>
                    <p className="text-slate-400">Entre com seu email cadastrado</p>
                </CardHeader>
                <CardContent>
                    <form action={loginAluno} className="space-y-4">
                        <div>
                            <Input
                                name="email"
                                placeholder="Seu Email"
                                className="bg-slate-950 border-slate-800 text-white"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold">
                            Entrar
                        </Button>

                        <div className="text-center mt-4">
                            <Link href="/cadastro" className="text-sm text-slate-500 hover:text-white">
                                Não tem conta? Cadastre-se
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}