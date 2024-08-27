"use client"; // Asegura que este componente se ejecute en el cliente

import React, { useState, useEffect } from 'react';

export default function LoginButton() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Intenta obtener los correos electrónicos después de la carga inicial
    const fetchEmails = async () => {
      setLoading(true);

      try {
        const response = await fetch('https://cleanbox-backend.vercel.app/api/emails', {
          credentials: 'include', // Importante para enviar cookies en la solicitud
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setEmails(data);
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } catch (error: any) {
        setError(error.message || 'Error desconocido');
        console.error('Error al obtener correos electrónicos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []); // El array vacío asegura que esto se ejecute solo una vez, después de que la página haya cargado

  const handleLogin = () => {
    // Redirige a la ruta de autenticación de Google
    window.location.href = '/api/auth/google';
  };

  if (loading) {
    return <p>Cargando correos...</p>;
  }

  return (
    <div>
      <button onClick={handleLogin} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        Iniciar sesión con Google
      </button>
      
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {emails.length > 0 && (
        <ul>
          {emails.map((email) => (
            <li key={email.id} className="mt-4 p-4 border rounded-lg shadow">
              <h2 className="font-bold">{email.subject}</h2>
              <p>{email.snippet}</p>
            </li>
          ))}
        </ul>
      )}
      
      {emails.length === 0 && !loading && !error && (
        <p>No se encontraron correos promocionales o sociales.</p>
      )}
    </div>
  );
}
