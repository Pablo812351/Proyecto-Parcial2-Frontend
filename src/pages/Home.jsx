import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get(`/api/games?search=${search}`);
        setGames(data);
      } catch (error) {
        console.error("Error fetching games", error);
      }
    };
    fetchGames();
  }, [search]);

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
          Explora el Catálogo
        </h1>
        
        <div className="flex justify-center">
          <input 
            type="text"
            placeholder="Buscar por título, género o empresa..."
            className="w-full max-w-2xl p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors shadow-lg text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>
      
      {games.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">No se encontraron juegos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map(game => (
            <div key={game._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300 flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={game.imageUrl || 'https://via.placeholder.com/300x150?text=No+Image'} 
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
                  <span className="text-gray-300 font-medium">{game.developer?.name || 'Desarrollador'}</span>
                </div>
                <Link 
                  to={`/games/${game._id}`}
                  className="mt-auto block w-full text-center bg-gray-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
