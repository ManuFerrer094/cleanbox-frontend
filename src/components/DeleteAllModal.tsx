"use client";
import { useState } from 'react';

interface DeleteAllModalProps {
  totalEmails: number;
  confirmAction: { action: string; emailId: string | null };
  setConfirmAction: (action: { action: string; emailId: string | null }) => void;
  deletingAll: boolean;
  setDeletingAll: (deleting: boolean) => void;
  handleDeleteAll: () => void;
}

export default function DeleteAllModal({
  totalEmails,
  confirmAction,
  setConfirmAction,
  deletingAll,
  setDeletingAll,
  handleDeleteAll
}: DeleteAllModalProps) {
  if (confirmAction.action !== 'delete-all') return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
        <p className="mb-4">¿Estás seguro de que deseas borrar los {totalEmails} correos?</p>
        <div className="flex space-x-4">
          <button
            onClick={handleDeleteAll}
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
  );
}
