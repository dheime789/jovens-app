import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogIn, User, Lock, AlertCircle } from "lucide-react";

export default async function LoginPage({
                                            searchParams,
                                        }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const erro = params.erro === "senha_invalida";

    async function login(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;

        const aluno = await prisma.user.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                password: password
            }
        });

        if (aluno) {
            const c = await cookies();
            c.set("aluno_logado", aluno.id, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 30 });
            redirect("/aluno");
        } else {
            redirect("/login?erro=senha_invalida");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <LogIn className="w-8 h-8 text-violet-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Acesso do Guerreiro</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={login} className="space-y-4">
                        {erro && <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded flex gap-2"><AlertCircle size={16}/> Nome ou senha errados.</div>}
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input name="name" placeholder="Seu Nome" className="pl-10 bg-slate-950 border-slate-800 text-white" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input name="password" type="password" placeholder="Sua Senha" className="pl-10 bg-slate-950 border-slate-800 text-white" required />
                        </div>
                        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold">ENTRAR</Button>
                        <div className="text-center mt-4">
                            <Link href="/cadastro" className="text-sm text-slate-500 hover:text-white">Criar conta nova</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}