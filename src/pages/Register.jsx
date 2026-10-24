import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { username, email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Crear Cuenta</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">Nombre de Usuario</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu apodo o nombre"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">Contraseña (mínimo 6 caracteres)</label>
            <input 
              type="password" 
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-4 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creando cuenta...</span>
              </>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-400 hover:underline font-semibold">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
