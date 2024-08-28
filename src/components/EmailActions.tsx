"use client";

interface EmailActionsProps {
    emailId: string;
    replyText: string;
    handleDelete: (emailId: string) => void;
    handleReply: (emailId: string, replyText: string) => void;
    handleArchive: (emailId: string) => void;
    handleAddLabel: (emailId: string, label: string) => void;
    confirmAndExecute: (action: string, emailId: string | null) => void;
  }
  
  export default function EmailActions({
    emailId,
    replyText,
    handleDelete,
    handleReply,
    handleArchive,
    handleAddLabel,
    confirmAndExecute,
  }: EmailActionsProps) {
    return (
      <div className="flex space-x-4">
        <button onClick={() => handleReply(emailId, replyText)} className="bg-green-500 text-white px-4 py-2 rounded-lg">
          Responder
        </button>
        <button onClick={() => confirmAndExecute('delete', emailId)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Eliminar
        </button>
        <button onClick={() => confirmAndExecute('archive', emailId)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
          Archivar
        </button>
        <select
          onChange={(e) => handleAddLabel(emailId, e.target.value)}
          className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg"
        >
          <option value="">Añadir etiqueta</option>
          <option value="Label_1">Etiqueta 1</option>
          <option value="Label_2">Etiqueta 2</option>
        </select>
      </div>
    );
  }
  