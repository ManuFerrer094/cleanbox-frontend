"use client";

import { useEffect, useState } from 'react';
import '../app/globals.css';

interface Email {
  id: string;
  subject: string;
  snippet: string;
  unsubscribeLink?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [totalEmails, setTotalEmails] = useState<number>(0); // Estado para el total de correos
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [confirmAction, setConfirmAction] = useState<{ action: string, emailId: string | null }>({ action: '', emailId: null });
  const [deletingAll, setDeletingAll] = useState<boolean>(false);  // Para manejar el spinner mientras se eliminan todos los correos

  const fetchEmails = async (token?: string, searchQuery = '') => {
    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails?pageToken=${token || ''}&query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener correos');
      }

      const data = await response.json();
      setEmails(data.messages);
      setPageToken(data.nextPageToken);  // Almacena el siguiente token
      setTotalEmails(data.totalEmails);  // Almacena el número total de correos
    } catch (error) {
      setError('No se pudieron cargar los correos.');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleSearch = () => {
    setEmails([]);
    setPageToken(null);
    fetchEmails(undefined, query);
  };

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

      setEmails(emails.filter((email) => email.id !== emailId));
      setTotalEmails(totalEmails - 1); // Actualiza el total de correos al eliminar uno
    } catch (error) {
      setError('No se pudo eliminar el correo.');
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar todos los correos.');
      }

      setEmails([]);  // Limpiar la lista de correos después de eliminarlos
      setTotalEmails(0); // Restablecer el total de correos
    } catch (error) {
      setError('No se pudieron eliminar todos los correos.');
    } finally {
      setDeletingAll(false);
      setConfirmAction({ action: '', emailId: null });
    }
  };

  const handleArchive = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: emailId }),
      });

      if (!response.ok) {
        throw new Error('No se pudo archivar el correo.');
      }

      setEmails(emails.filter((email) => email.id !== emailId));
      setTotalEmails(totalEmails - 1); // Actualiza el total de correos al archivar uno
    } catch (error) {
      setError('No se pudo archivar el correo.');
    }
  };

  const handleAddLabel = async (emailId: string, label: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/label`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: emailId, label }),
      });

      if (!response.ok) {
        throw new Error('No se pudo añadir la etiqueta.');
      }

      alert('Etiqueta añadida exitosamente');
    } catch (error) {
      setError('No se pudo añadir la etiqueta.');
    }
  };

  const handleReply = async (emailId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId: emailId, text: replyTexts[emailId] }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la respuesta.');
      }

      alert('Respuesta enviada exitosamente');
      setReplyTexts({ ...replyTexts, [emailId]: '' });  // Limpiar el campo de texto después de enviar la respuesta
    } catch (error) {
      setError('No se pudo enviar la respuesta.');
    }
  };

  const confirmAndExecute = (action: string, emailId: string | null = null) => {
    setConfirmAction({ action, emailId });
  };

  const executeAction = () => {
    if (confirmAction.action === 'delete') {
      handleDelete(confirmAction.emailId!);
    } else if (confirmAction.action === 'delete-all') {
      handleDeleteAll();
    } else if (confirmAction.action === 'archive') {
      handleArchive(confirmAction.emailId!);
    }
    setConfirmAction({ action: '', emailId: null });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl mb-4 text-gray-900 dark:text-white">Por favor, inicia sesión para ver tus correos</h1>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Iniciar Sesión con Google
        </button>
      </div>
    );
  }

  if (loading) {
    return <p className="text-center text-gray-900 dark:text-white">Cargando correos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4 text-gray-900 dark:text-white">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Correos Promocionales y Sociales</h1>
        <div className="flex items-center space-x-4">
          <p>Total correos: {totalEmails}</p>
          <button 
            onClick={() => confirmAndExecute('delete-all')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            disabled={deletingAll}
          >
            {deletingAll ? 'Eliminando...' : 'Eliminar todos'}
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <input 
          type="text" 
          placeholder="Buscar correos..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <button 
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Buscar
        </button>
      </div>

      {confirmAction.action === 'delete-all' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <p className="mb-4">¿Estás seguro de que deseas borrar los {totalEmails} correos?</p>
            <div className="flex space-x-4">
              <button 
                onClick={executeAction} 
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                disabled={deletingAll}
              >
                Sí
              </button>
              <button 
                onClick={() => setConfirmAction({ action: '', emailId: null })} 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
            {deletingAll && (
              <div className="mt-4 flex justify-center">
                <div className="loader border-t-transparent border-solid border-gray-500 rounded-full w-8 h-8 border-4 animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {emails.length === 0 ? (
        <p className="text-center">No se encontraron correos.</p>
      ) : (
        <ul className="space-y-4">
          {emails.map((email) => (
            <li key={email.id} className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800">
              <h3 className="text-xl font-bold">{email.subject}</h3>
              <p className="mb-4">{email.snippet}</p>
              <textarea
                placeholder="Escribe tu respuesta..."
                value={replyTexts[email.id] || ''}
                onChange={(e) => setReplyTexts({ ...replyTexts, [email.id]: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg w-full mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleReply(email.id)} 
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Responder
                </button>
                <button 
                  onClick={() => confirmAndExecute('delete', email.id)} 
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Eliminar
                </button>
                <button 
                  onClick={() => confirmAndExecute('archive', email.id)} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Archivar
                </button>
                <select 
                  onChange={(e) => handleAddLabel(email.id, e.target.value)} 
                  className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Añadir etiqueta</option>
                  <option value="Label_1">Etiqueta 1</option>
                  <option value="Label_2">Etiqueta 2</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {pageToken && (
        <button 
          onClick={() => fetchEmails(pageToken)} 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Cargar más
        </button>
      )}
    </div>
  );
}
