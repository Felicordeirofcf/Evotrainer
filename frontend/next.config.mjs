import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Pasta onde os arquivos do Service Worker serão gerados
  disable: process.env.NODE_ENV === "development", // Desativa em dev para não atrapalhar os testes
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora os erros do ESLint durante o build no Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora os erros de tipagem do TypeScript durante o build no Vercel
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);