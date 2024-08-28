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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar si hay un token en la URL y almacenarlo
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, '/');
    } else {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Función para manejar la autenticación
  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  // Función para eliminar un correo
  const handleDelete = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: emailId }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el correo');
      }

      // Eliminar el correo del estado después de eliminarlo en el servidor
      setEmails(emails.filter(email => email.id !== emailId));
    } catch (error) {
      setError('No se pudo eliminar el correo.');
    }
  };

  // Función para desuscribirse
  const handleUnsubscribe = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: emailId }),
      });

      if (!response.ok) {
        throw new Error('Error al desuscribirse');
      }

      const data = await response.json();
      if (data.unsubscribeLink) {
        window.open(data.unsubscribeLink, '_blank');
      } else {
        throw new Error('No se encontró un enlace de desuscripción');
      }
    } catch (error) {
      setError('No se pudo desuscribir.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchEmails = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails`, {
            headers: {
              Authorization: `Bearer ${token}`,
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
              <button onClick={() => handleDelete(email.id)}>Eliminar</button>
              <button onClick={() => handleUnsubscribe(email.id)}>Desuscribirse</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
