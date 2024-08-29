"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
        Iniciar Sesión con Google
      </button>
    </div>
  );
}
