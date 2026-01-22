import { Button } from "@/components/ui/button";
import { BrainCircuit, Construction } from "lucide-react";
import Link from "next/link";

export default function QuizPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-pink-900/20 rounded-full flex items-center justify-center text-pink-500 mb-6">
                <BrainCircuit size={48} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Desafios Bíblicos</h1>
            <p className="text-slate-400 mb-8 max-w-xs">Os quizzes semanais estarão disponíveis aqui em breve. Prepare-se para testar seu conhecimento!</p>

            <Link href="/aluno">
                <Button variant="outline" className="border-slate-700 text-slate-300">Voltar ao Painel</Button>
            </Link>
        </div>
    );
}