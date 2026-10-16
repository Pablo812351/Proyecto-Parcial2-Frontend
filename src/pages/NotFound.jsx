import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
        404
      </h1>
      <h2 className="text-3xl font-bold text-white mb-6">Página no encontrada</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Parece que te has perdido en el ciberespacio. La página que estás buscando no existe o fue movida.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}

export default NotFound;
