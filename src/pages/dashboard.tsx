import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener correos electrónicos desde el backend
    const fetchEmails = async () => {
      try {
        const response = await fetch('https://cleanbox-backend.vercel.app/api/emails', {
          credentials: 'include', // Importante para enviar cookies en la solicitud
        });
        const data = await response.json();
        setEmails(data);
      } catch (error) {
        console.error('Error al obtener correos electrónicos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) {
    return <p>Cargando correos...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {emails.length > 0 ? (
        <ul>
          {emails.map((email) => (
            <li key={email.id}>
              <h2>{email.subject}</h2>
              <p>{email.snippet}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No se encontraron correos promocionales o sociales.</p>
      )}
    </div>
  );
};

export default Dashboard;
