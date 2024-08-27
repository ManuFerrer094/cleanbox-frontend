import LoginButton from '../components/LoginButton';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Bienvenido a CleanBox</h1>
        <p className="mb-6">Inicia sesión con Google para acceder a tus correos.</p>        
        <LoginButton />
      </div>
    </div>
  );
}
