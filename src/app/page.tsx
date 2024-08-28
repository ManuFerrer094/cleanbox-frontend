"use client";

import { useEffect, useState } from 'react';

interface Email {
  id: string;
  subject: string;
  snippet: string;
  unsubscribeLink?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

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
        throw new Error('No se pudo eliminar el correo.');
      }

      // Actualizar la lista de correos después de eliminar uno
      setEmails(emails.filter((email) => email.id !== emailId));
    } catch (error) {
      setError('No se pudo eliminar el correo.');
    }
  };

  const handleUnsubscribe = (unsubscribeLink: string | undefined) => {
    if (unsubscribeLink) {
      window.open(unsubscribeLink, '_blank');
    } else {
      alert('No se encontró el enlace de desuscripción.');
    }
  };

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
              <div>
                {/* Botón de Eliminar */}
                <button onClick={() => handleDelete(email.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2">
                  Eliminar
                </button>
                {/* Botón de Desuscribirse */}
                {email.unsubscribeLink && (
                  <button
                    onClick={() => handleUnsubscribe(email.unsubscribeLink)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Desuscribirse
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
