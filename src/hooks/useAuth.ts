"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://cleanbox-backend.vercel.app/auth/check', { // Cambiado a localhost:5000
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Esto asegura que las cookies se envíen con la solicitud
        });

        if (!response.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error during authentication check:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth(); // Verificar la autenticación al cargar el componente
  }, []);

  return { isAuthenticated, loading };
}
