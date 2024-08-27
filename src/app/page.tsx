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

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // Utilizamos la variable de entorno para la URL del backend
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
  }, []);

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
