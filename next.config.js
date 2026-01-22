/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Ignora erros de "regras" chatas
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignora erros de tipagem
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;