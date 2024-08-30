"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Bienvenido a tu Dashboard</h1>
        <p className="text-lg text-gray-300 mb-8">
          Este es tu panel de control personalizado donde puedes gestionar todas tus herramientas y servicios. 
          Explora las funcionalidades disponibles para optimizar tu trabajo y mejorar tu productividad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/emails" passHref>
            <div className="block p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-transform transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2 text-white">Gestión de Emails</h2>
              <p className="text-gray-400">
                Accede a la página de Emails para gestionar y organizar tus correos electrónicos de forma eficiente.
              </p>
            </div>
          </Link>
          {/* Aquí podrías añadir más cards para otras funcionalidades futuras */}
        </div>
      </div>
    </DashboardLayout>
  );
}
