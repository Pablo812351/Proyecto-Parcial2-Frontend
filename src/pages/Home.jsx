import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/games?search=${encodeURIComponent(search.trim())}`);
      setGames(data);
    } catch (err) {
      console.error('Error al obtener catálogo de videojuegos:', err);
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor para cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [search]);

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 pb-3 leading-normal inline-block">
          Explora el Catálogo
        </h1>
        
        <div className="flex justify-center">
          <input 
            type="text"
            placeholder="Buscar por título, género o empresa desarrolladora..."
            className="w-full max-w-2xl p-4 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors shadow-lg text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-6 rounded-2xl max-w-xl mx-auto my-8 text-center">
          <p className="font-semibold mb-3">{error}</p>
          <button 
            onClick={fetchGames}
            className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-5 rounded-lg transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24 text-gray-400 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          Cargando catálogo...
        </div>
      ) : !error && games.length === 0 ? (
        <p className="text-center text-gray-500 text-xl py-12">No se encontraron videojuegos en el catálogo.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map(game => (
            <div key={game._id} className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col group border border-gray-700/60 hover:border-blue-500/50">
              <div className="relative h-48 overflow-hidden bg-gray-900">
                <img 
                  src={game.imageUrl || 'https://via.placeholder.com/300x150?text=Sin+Imagen'} 
                  alt={game.title} 
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                />
                <span className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-semibold shadow-lg">
                  {game.genre?.name || 'Género'}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-2 text-white truncate">{game.title}</h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{game.description}</p>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-300 font-medium">{game.developer?.name || 'Desarrolladora'}</span>
                </div>
                <Link 
                  to={`/games/${game._id}`}
                  className="mt-auto block w-full text-center bg-gray-700 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
