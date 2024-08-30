"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailList from '@/components/EmailList';
import SearchBar from '@/components/SearchBar';
import DeleteAllModal from '@/components/DeleteAllModal';
import { useAuth } from '@/hooks/useAuth';

interface Email {
  id: string;
  subject: string;
  snippet: string;
}

export default function EmailsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [totalEmails, setTotalEmails] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('');
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ action: string; emailId: string | null }>({ action: '', emailId: null });
  const [deletingAll, setDeletingAll] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

  const fetchEmails = async (token = '', searchQuery = '') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails?pageToken=${token}&query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener correos');
      }
  
      const data = await response.json();
      setEmails(data.messages || []);
      setPageToken(data.nextPageToken || null);
      setTotalEmails(data.totalEmails || 0);
    } catch (error) {
      setError('No se pudieron cargar los correos.');
    }
  };

  const handleSearch = () => {
    setEmails([]);
    setPageToken(null);
    fetchEmails('', query);
  };

  const handleEmailDelete = (emailId: string) => {
    setEmails(emails.filter((email) => email.id !== emailId));
    setTotalEmails(totalEmails - 1);
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete/all`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar todos los correos.');
      }

      setEmails([]);
      setTotalEmails(0);
    } catch (error) {
      setError('No se pudieron eliminar todos los correos.');
    } finally {
      setDeletingAll(false);
      setConfirmAction({ action: '', emailId: null });
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 text-gray-900 dark:text-white">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Correos Promocionales y Sociales</h1>
        {/* <div className="flex items-center space-x-4">
          <p>Total correos: {totalEmails}</p>
          <button onClick={() => setConfirmAction({ action: 'delete-all', emailId: null })} className="bg-red-500 text-white px-4 py-2 rounded-lg" disabled={deletingAll}>
            {deletingAll ? 'Eliminando...' : 'Eliminar todos'}
          </button>
        </div> */}
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
