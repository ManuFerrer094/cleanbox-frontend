"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');

    if (existingToken) {
      setToken(existingToken); 
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        setToken(tokenFromUrl); 
      }
    }
  }, [router]);

  useEffect(() => {
    if (token || isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [token, isAuthenticated, router]);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      {!isAuthenticated && (
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Iniciar Sesión con Google
        </button>
      )}
    </div>
  );
}
