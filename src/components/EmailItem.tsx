"use client";

import { useState, useEffect } from 'react';

interface Email {
  id: string;
  subject: string;
  snippet: string;
}

interface EmailItemProps {
  email: Email;
  onEmailDelete: (emailId: string) => void;
}

export default function EmailItem({ email, onEmailDelete }: EmailItemProps) {
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, '/dashboard'); // Remueve el token de la URL y redirige
    }
  }, []);

  const handleRequest = async (url: string, method: string, body: object) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No se encontró un token de autenticación. Por favor, inicia sesión de nuevo.');
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');

      if (response.status === 403) {
        setError('No tienes permiso para realizar esta acción. Por favor, verifica tu sesión.');
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la solicitud:', errorText);
        throw new Error('Ocurrió un error durante la solicitud.');
      }

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  const handleDelete = async () => {
    const result = await handleRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/delete`, 'POST', { messageId: email.id });
    if (result) {
      onEmailDelete(email.id);
    }
  };

  const handleReply = async () => {
    const result = await handleRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/reply`, 'POST', { messageId: email.id, text: replyText });
    if (result) {
      setReplyText('');
    }
  };

  const handleArchive = async () => {
    const result = await handleRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/archive`, 'POST', { messageId: email.id });
    if (result) {
      onEmailDelete(email.id);
    }
  };

  const handleAddLabel = async (label: string) => {
    if (!label) return; // Evitar agregar etiquetas vacías
    const result = await handleRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/label`, 'POST', { messageId: email.id, label });
    if (result) {
      alert('Etiqueta añadida exitosamente');
    } else {
      setError('No se pudo añadir la etiqueta.');
    }
  };

  return (
    <li className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-xl font-bold">{email.subject}</h3>
      <p className="mb-4">{email.snippet}</p>
      <textarea
        placeholder="Escribe tu respuesta..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div className="flex space-x-4">
        <button onClick={handleReply} className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Responder
        </button>
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Eliminar
        </button>
        <button onClick={handleArchive} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
          Archivar
        </button>
        <select onChange={(e) => handleAddLabel(e.target.value)} className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Añadir etiqueta</option>
          <option value="Label_1">Etiqueta 1</option>
          <option value="Label_2">Etiqueta 2</option>
        </select>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </li>
  );
}
