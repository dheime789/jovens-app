import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function SetupPage() {

    async function criarTribos() {
        "use server";

        // Lista oficial das Tribos
        const tribos = [
            { id: "tribo-juda", name: "Tribo de Judá 🦁" },
            { id: "tribo-simeao", name: "Tribo de Simeão ⚔️" },
            { id: "tribo-naftali", name: "Tribo de Naftali 🦌" },
            { id: "tribo-benjamim", name: "Tribo de Benjamim 🐺" },
            { id: "tribo-levi", name: "Tribo de Levi 🛡️" },
            { id: "tribo-ruben", name: "Tribo de Rúben 🌊" },
        ];

        console.log("Iniciando criação das tribos...");

        for (const tribo of tribos) {
            await prisma.squad.upsert({
                where: { id: tribo.id },
                update: {}, // Se já existe, mantém igual
                create: {
                    id: tribo.id,
                    name: tribo.name,
                    totalXp: 0
                }
            });
        }

        console.log("Tribos criadas com sucesso!");
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-6 p-4 text-center">
            <h1 className="text-3xl font-bold text-yellow-500">CONFIGURAÇÃO INICIAL 🕎</h1>
            <p className="text-slate-400">Clique abaixo para criar as 6 tribos no banco de dados.</p>

            <form action={criarTribos}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-xl py-8 px-10 font-bold shadow-lg shadow-violet-900/20">
                    GERAR TRIBOS AGORA 🚀
                </Button>
            </form>
        </div>
    );
}