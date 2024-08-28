"use client";

import { useState } from 'react';

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

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: email.id }),
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el correo.');
      }

      onEmailDelete(email.id);
    } catch (error) {
      setError('No se pudo eliminar el correo.');
    }
  };

  const handleReply = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: email.id, text: replyText }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la respuesta.');
      }

      setReplyText('');
    } catch (error) {
      setError('No se pudo enviar la respuesta.');
    }
  };

  const handleArchive = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: email.id }),
      });

      if (!response.ok) {
        throw new Error('No se pudo archivar el correo.');
      }

      onEmailDelete(email.id); // Remueve el correo de la lista al archivarlo
    } catch (error) {
      setError('No se pudo archivar el correo.');
    }
  };

  const handleAddLabel = async (label: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: email.id, label }),
      });

      if (!response.ok) {
        throw new Error('No se pudo añadir la etiqueta.');
      }

      alert('Etiqueta añadida exitosamente');
    } catch (error) {
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
