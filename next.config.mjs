/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Ignora erros de lint durante o deploy
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignora erros de tipo durante o deploy
        ignoreBuildErrors: true,
    },
};

export default nextConfig;