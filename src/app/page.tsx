"use client";

import { useEffect, useState } from 'react';

interface Email {
  id: string;
  subject: string;
  snippet: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Estado para la autenticación

  // Función para manejar la autenticación
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; // Redirige a la autenticación de Google
  };

  // Función para verificar si el usuario está autenticado
  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check-session`, {
        credentials: 'include', // Importante para enviar las cookies
      });

      if (response.ok) {
        setIsAuthenticated(true); // Usuario autenticado
      } else {
        setIsAuthenticated(false); // Usuario no autenticado
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth(); // Comprobamos la autenticación al cargar la página

    if (isAuthenticated) {
      const fetchEmails = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails`, {
            credentials: 'include', // Importante para enviar las cookies
          });

          if (!response.ok) {
            throw new Error('Error al obtener correos');
          }

          const data: Email[] = await response.json();
          setEmails(data);
        } catch (error) {
          setError('No se pudieron cargar los correos.');
        } finally {
          setLoading(false);
        }
      };

      fetchEmails();
    }
  }, [isAuthenticated]); // Dependencia en isAuthenticated para volver a cargar correos después del login

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Por favor, inicia sesión para ver tus correos</h1>
        <button onClick={handleLogin}>Iniciar Sesión con Google</button>
      </div>
    );
  }

  if (loading) {
    return <p>Cargando correos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Correos Promocionales y Sociales</h1>
      {emails.length === 0 ? (
        <p>No se encontraron correos.</p>
      ) : (
        <ul>
          {emails.map((email) => (
            <li key={email.id}>
              <h3>{email.subject}</h3>
              <p>{email.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
