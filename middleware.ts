import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

    // 1. Verifica se a pessoa está tentando entrar na área do professor
    if (request.nextUrl.pathname.startsWith('/professor')) {

        // 2. Procura um "crachá" (cookie) chamado 'professor_logado'
        const token = request.cookies.get('professor_logado')?.value

        // 3. Se não tiver o crachá, chuta a pessoa para a tela de login do admin
        if (token !== 'true') {
            return NextResponse.redirect(new URL('/admin-login', request.url))
        }
    }

    return NextResponse.next()
}

// Configuração: Onde esse segurança deve trabalhar?
export const config = {
    matcher: '/professor/:path*', // Protege tudo dentro de /professor
}