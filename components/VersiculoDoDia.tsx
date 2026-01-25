"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useEffect, useState } from "react";

const versiculos = [
    { texto: "Ninguém o despreze pelo fato de você ser jovem, mas seja um exemplo para os fiéis na palavra, no procedimento, no amor, na fé e na pureza.", ref: "1 Timóteo 4:12" },
    { texto: "Escondi a tua palavra no meu coração, para eu não pecar contra ti.", ref: "Salmos 119:11" },
    { texto: "Jovens, eu lhes escrevi, porque vocês são fortes, e em vocês a Palavra de Deus permanece...", ref: "1 João 2:14" },
    { texto: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
    { texto: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.", ref: "Mateus 6:33" },
    { texto: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", ref: "Josué 1:9" },
    { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
    { texto: "Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!", ref: "Filipenses 4:4" }
];

export function VersiculoDoDia() {
    const [versiculo, setVersiculo] = useState(versiculos[0]);

    useEffect(() => {
        // Escolhe um aleatório quando a tela carrega
        const indice = Math.floor(Math.random() * versiculos.length);
        setVersiculo(versiculos[indice]);
    }, []);

    return (
        <Card className="bg-violet-900/20 border-violet-500/30 mb-6">
            <CardContent className="p-4 flex gap-4">
                <div className="bg-violet-500/20 p-2 rounded-full h-fit">
                    <Quote className="text-violet-400" size={20} />
                </div>
                <div>
                    <p className="text-sm text-slate-200 italic mb-2">"{versiculo.texto}"</p>
                    <p className="text-xs text-violet-400 font-bold uppercase">- {versiculo.ref}</p>
                </div>
            </CardContent>
        </Card>
    );
}