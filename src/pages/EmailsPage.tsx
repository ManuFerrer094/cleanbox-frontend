"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmailList from '@/components/EmailList';
import SearchBar from '@/components/SearchBar';
import DeleteAllModal from '@/components/DeleteAllModal';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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
  const [previousTokens, setPreviousTokens] = useState<string[]>(['']);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [confirmAction, setConfirmAction] = useState<{ action: string; emailId: string | null }>({ action: '', emailId: null });
  const [deletingAll, setDeletingAll] = useState<boolean>(false);

  const maxResults = 10;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails(previousTokens[0], query, 1);
    }
  }, [isAuthenticated]);

  const fetchEmails = async (token = '', searchQuery = '', page = 1) => {
    try {
      const accessToken = localStorage.getItem('token');
      
      if (!accessToken) {
        throw new Error('No hay token de autenticación.');
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/emails?pageToken=${token}&query=${searchQuery}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('No autorizado: Verifica tu autenticación.');
        }
        throw new Error('Error al obtener correos');
      }
  
      const data = await response.json();
      setEmails(data.messages || []);
      setPageToken(data.nextPageToken || null);
      setTotalEmails(data.totalEmails || 0);
      setCurrentPage(page);
     
      if (page >= previousTokens.length) {
        setPreviousTokens((prevTokens) => [...prevTokens, data.nextPageToken || '']);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'No se pudieron cargar los correos.');
      } else {
        setError('No se pudieron cargar los correos.');
      }
    }
  };

  const handleSearch = () => {
    setEmails([]);
    setPageToken(null);
    setPreviousTokens(['']);
    setCurrentPage(1);
    fetchEmails('', query, 1);
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

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      fetchEmails(previousTokens[currentPage - 2], query, currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pageToken && currentPage < Math.ceil(totalEmails / maxResults)) {
      fetchEmails(pageToken, query, currentPage + 1);
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

  const totalPages = Math.ceil(totalEmails / maxResults);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 text-gray-900 dark:text-white h-full max-w-screen-lg">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Correos Promocionales y Sociales</h1>
        </div>

        <SearchBar query={query} setQuery={setQuery} handleSearch={handleSearch} />

        <div className="email-list-container overflow-auto h-[calc(100vh-300px)]">
          <EmailList emails={emails} onEmailDelete={handleEmailDelete} />
        </div>

        <DeleteAllModal
          totalEmails={totalEmails}
          confirmAction={confirmAction}
          setConfirmAction={setConfirmAction}
          deletingAll={deletingAll}
          setDeletingAll={setDeletingAll}
          handleDeleteAll={handleDeleteAll}
        />

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={goToPreviousPage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>

          <span>Página {currentPage} de {totalPages}</span>

          <button
            onClick={goToNextPage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            disabled={!pageToken || currentPage >= totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
