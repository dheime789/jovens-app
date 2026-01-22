import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserPlus, Lock, User } from "lucide-react";

export default function CadastroPage() {

    async function cadastrar(formData: FormData) {
        "use server";

        const name = formData.get("name") as string;
        const password = formData.get("password") as string;

        if (!name || !password) return;

        // Verifica se já existe alguém com esse nome
        const jaExiste = await prisma.user.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (jaExiste) {
            redirect("/cadastro?erro=nome_em_uso");
        }

        // Cria o Jovem (Sem tribo ainda)
        await prisma.user.create({
            data: {
                name: name,
                password: password, // Em app real usaria criptografia, mas aqui vai simples
                role: "JOVEM",
                level: 1,
                xp: 0
            }
        });

        // Manda para o Login
        redirect("/login?sucesso=criado");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-violet-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Criar Personagem</CardTitle>
                    <p className="text-slate-400">Comece sua jornada agora</p>
                </CardHeader>
                <CardContent>
                    <form action={cadastrar} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input name="name" placeholder="Seu Nome Completo" className="pl-10 bg-slate-950 border-slate-800 text-white" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input name="password" type="password" placeholder="Crie uma Senha Secreta" className="pl-10 bg-slate-950 border-slate-800 text-white" required />
                        </div>
                        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 font-bold">
                            CRIAR CONTA
                        </Button>
                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-slate-500 hover:text-white">Já tem conta? Entrar</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}