import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Favorites() {
  const [games, setGames] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await api.get('/api/auth/favorites', config);
        setGames(data);
      } catch (error) {
        console.error("Error fetching favorites", error);
      }
    };
    fetchFavorites();
  }, [user, navigate]);

  return (
    <div className="container mx-auto p-4 mt-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Mis Favoritos ❤️
        </h1>
        <p className="text-gray-400 text-sm">
          Puedes gestionar todos tus juegos y estados en tu{' '}
          <Link to="/library" className="text-blue-400 hover:underline font-semibold">
            Biblioteca Personal 📚
          </Link>
        </p>
      </header>
      
      {games.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">Aún no tienes juegos guardados en favoritos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map(game => (
            <div key={game._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col group">
              <img 
                src={game.imageUrl || 'https://via.placeholder.com/300x150?text=No+Image'} 
                alt={game.title} 
                className="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
              />
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold mb-2 text-white truncate">{game.title}</h2>
                <Link 
                  to={`/games/${game._id}`}
                  className="mt-auto block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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

export default Favorites;
