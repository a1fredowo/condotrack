import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Deshabilitar chequeo de tipos en build (para Vercel)
  typescript: {
    // ⚠️ Peligrosamente permite el build aunque haya errores de TypeScript
    ignoreBuildErrors: true,
  },
  
  // Deshabilitar ESLint durante el build
  eslint: {
    // ⚠️ Permite el build aunque haya errores de ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
