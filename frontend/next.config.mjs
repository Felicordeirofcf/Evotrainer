/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora os erros do ESLint durante o build no Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora os erros de tsipagem do TypeScript durante o build no Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;