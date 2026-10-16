import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition">
          🎮 Gaming Hub
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">Inicio</Link>
          
          {user ? (
            <>
              <Link to="/library" className="text-gray-300 hover:text-white font-medium">
                📚 Mi Biblioteca
              </Link>
              {user.role === 'ADMIN_ROLE' && (
                <Link to="/admin" className="text-purple-400 hover:text-purple-300">Admin</Link>
              )}
              <span className="text-gray-400">| Hola, {user.username}</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 ml-4">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-400 hover:text-blue-300">Entrar</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
