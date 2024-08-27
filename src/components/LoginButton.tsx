// src/components/LoginButton.tsx

"use client"; // Asegura que este componente se ejecute en el cliente

import React from 'react';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/google'; // Redirige a la ruta de autenticación
  };

  return (
    <button onClick={handleLogin} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
      Iniciar sesión con Google
    </button>
  );
}
