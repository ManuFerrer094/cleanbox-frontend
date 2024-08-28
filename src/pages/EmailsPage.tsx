"use client";

import { useEffect, useState } from 'react';
import EmailList from '../components/EmailList';
import SearchBar from '../components/SearchBar';
import DeleteAllModal from '../components/DeleteAllModal';

interface Email {
  id: string;
  subject: string;
  snippet: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [totalEmails, setTotalEmails] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; emailId: string | null }>({ action: '', emailId: null });
  const [deletingAll, setDeletingAll] = useState<boolean>(false);

  const fetchEmails = async (token = '', searchQuery = '') => {
    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails?pageToken=${token}&query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener correos');
      }

      const data = await response.json();
      setEmails(data.messages);
      setPageToken(data.nextPageToken);
      setTotalEmails(data.totalEmails);
    } catch (error) {
      setError('No se pudieron cargar los correos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const handleSearch = () => {
    setEmails([]);
    setPageToken(null);
    fetchEmails(undefined, query);
  };

  const handleEmailDelete = (emailId: string) => {
    setEmails(emails.filter((email) => email.id !== emailId));
    setTotalEmails(totalEmails - 1);
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete/all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar todos los correos.');
      }

      setEmails([]); // Limpiar la lista de correos después de eliminarlos
      setTotalEmails(0); // Restablecer el total de correos
    } catch (error) {
      setError('No se pudieron eliminar todos los correos.');
    } finally {
      setDeletingAll(false);
      setConfirmAction({ action: '', emailId: null });
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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl mb-4 text-gray-900 dark:text-white">Por favor, inicia sesión para ver tus correos</h1>
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
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
          <button onClick={() => setConfirmAction({ action: 'delete-all', emailId: null })} className="bg-red-500 text-white px-4 py-2 rounded-lg" disabled={deletingAll}>
            {deletingAll ? 'Eliminando...' : 'Eliminar todos'}
          </button>
        </div>
      </div>

      <SearchBar query={query} setQuery={setQuery} handleSearch={handleSearch} />
      <EmailList emails={emails} onEmailDelete={handleEmailDelete} />
      <DeleteAllModal
        totalEmails={totalEmails}
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
        deletingAll={deletingAll}
        setDeletingAll={setDeletingAll}
        handleDeleteAll={handleDeleteAll}
      />

      {pageToken && (
        <button onClick={() => fetchEmails(pageToken)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
          Cargar más
        </button>
      )}
    </div>
  );
}
