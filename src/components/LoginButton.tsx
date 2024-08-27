"use client"; // Asegura que este componente se ejecute en el cliente

import React, { useState } from 'react';

export default function LoginButton() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      // Redirige a la ruta de autenticación de Google
      window.location.href = '/api/auth/google';

      // Después de autenticarse, obtén los correos electrónicos
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

  if (loading) {
    return <p>Cargando correos...</p>;
  }

  return (
    <div>
      <button onClick={handleLogin} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
        Iniciar sesión con Google
      </button>
      
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
      
      {emails.length === 0 && !loading && (
        <p>No se encontraron correos promocionales o sociales.</p>
      )}
    </div>
  );
}
