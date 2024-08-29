// src/components/DashboardLayout.tsx
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
        </div>
        <nav className="px-6 pt-4">
          <ul>
            <li>
              <a href="/dashboard/emails" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                Emails
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
