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

  // Verificar si hay un token en la URL y almacenarlo
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token); // Almacenar el token en localStorage
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, '/'); // Limpiar el token de la URL
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Función para manejar la autenticación
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; // Redirige a la autenticación de Google
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchEmails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails`, {
            headers: {
              Authorization: `Bearer ${token}`, // Enviar el token JWT en el encabezado Authorization
            },
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
  }, [isAuthenticated]);

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
