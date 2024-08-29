/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://cleanbox-backend.vercel.app/auth/:path*', // Asegúrate de que el backend está corriendo en este puerto
      },
    ];
  },
};

export default nextConfig;
