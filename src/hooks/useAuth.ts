"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        router.push('/login'); // Redirige a la página de inicio de sesión si no hay token
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);

        if (!data.isAuthenticated) {
          localStorage.removeItem('token'); // Elimina el token si la autenticación falla
          router.push('/login');
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        localStorage.removeItem('token'); // Elimina el token si ocurre un error
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isAuthenticated, loading };
}
