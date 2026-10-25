import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const STATUS_CONFIG = {
  'Jugando': {
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    dot: 'bg-emerald-400',
    icon: '▶️',
    label: 'Jugando'
  },
  'Pendiente': {
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
    dot: 'bg-amber-400',
    icon: '⏳',
    label: 'Pendiente'
  },
  'Completado': {
    badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    dot: 'bg-blue-400',
    icon: '🏆',
    label: 'Completado'
  },
  'Abandonado': {
    badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
    dot: 'bg-rose-400',
    icon: '⛔',
    label: 'Abandonado'
  }
};

const ALL_STATUSES = ['Pendiente', 'Jugando', 'Completado', 'Abandonado'];

function Library() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'Todos';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchLibrary();
  }, [user, navigate]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get('/api/library', config);
      setItems(data);
    } catch (error) {
      console.error('Error al obtener la biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      setActionLoading(gameId);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put(`/api/library/${gameId}`, { status: newStatus || null }, config);

      setItems(prev => prev.map(item => item.game._id === gameId ? data : item));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setError(error.response?.data?.message || 'No se pudo actualizar el estado del videojuego.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFavorite = async (gameId) => {
    try {
      setActionLoading(gameId);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post(`/api/library/toggle-favorite/${gameId}`, {}, config);

      if (!data.item) {
        setItems(prev => prev.filter(item => item.game._id !== gameId));
      } else {
        setItems(prev => prev.map(item => {
          if (item.game._id === gameId) {
            return { ...item, isFavorite: data.isFavorite };
          }
          return item;
        }));
      }
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      setError(error.response?.data?.message || 'No se pudo alternar el favorito.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (gameId, title) => {
    if (!window.confirm(`¿Quitar "${title}" de tu biblioteca personal?`)) return;

    try {
      setActionLoading(gameId);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/api/library/${gameId}`, config);
      setItems(prev => prev.filter(item => item.game._id !== gameId));
    } catch (error) {
      console.error('Error al eliminar de biblioteca:', error);
      setError(error.response?.data?.message || 'Error al quitar el videojuego de la biblioteca.');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: items.length,
    jugando: items.filter(i => i.status === 'Jugando').length,
    pendiente: items.filter(i => i.status === 'Pendiente').length,
    completado: items.filter(i => i.status === 'Completado').length,
    abandonado: items.filter(i => i.status === 'Abandonado').length,
    favoritos: items.filter(i => i.isFavorite).length
  };

  const filteredItems = items.filter(item => {
    if (!item.game) return false;

    if (activeFilter === 'Favoritos' && !item.isFavorite) return false;
    if (activeFilter !== 'Todos' && activeFilter !== 'Favoritos' && item.status !== activeFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.game.title?.toLowerCase().includes(q);
      const genreMatch = item.game.genre?.name?.toLowerCase().includes(q);
      const devMatch = item.game.developer?.name?.toLowerCase().includes(q);
      return titleMatch || genreMatch || devMatch;
    }

    return true;
  });

  return (
    <div className="container mx-auto p-4 max-w-7xl animate-fade-in">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
              <span>📚</span>
              <span>Mi Biblioteca Personal</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Haz clic en cualquiera de las tarjetas para filtrar tus videojuegos por estado.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl transition shadow-lg self-start md:self-auto"
          >
            <span>+</span>
            <span>Explorar más juegos</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <button
            onClick={() => setActiveFilter('Todos')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Todos'
                ? 'bg-blue-600/20 border-blue-500 shadow-lg ring-1 ring-blue-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="text-xs text-gray-400 uppercase font-semibold">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </button>

          <button
            onClick={() => setActiveFilter('Jugando')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Jugando'
                ? 'bg-emerald-500/20 border-emerald-500 shadow-lg ring-1 ring-emerald-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 uppercase font-semibold">
              <span>▶️</span> Jugando
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.jugando}</div>
          </button>

          <button
            onClick={() => setActiveFilter('Pendiente')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Pendiente'
                ? 'bg-amber-500/20 border-amber-500 shadow-lg ring-1 ring-amber-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-amber-400 uppercase font-semibold">
              <span>⏳</span> Pendiente
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.pendiente}</div>
          </button>

          <button
            onClick={() => setActiveFilter('Completado')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Completado'
                ? 'bg-blue-500/20 border-blue-500 shadow-lg ring-1 ring-blue-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-blue-400 uppercase font-semibold">
              <span>🏆</span> Completado
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.completado}</div>
          </button>

          <button
            onClick={() => setActiveFilter('Abandonado')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Abandonado'
                ? 'bg-rose-500/20 border-rose-500 shadow-lg ring-1 ring-rose-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-rose-400 uppercase font-semibold">
              <span>⛔</span> Abandonado
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.abandonado}</div>
          </button>

          <button
            onClick={() => setActiveFilter('Favoritos')}
            className={`p-4 rounded-xl text-left transition border ${
              activeFilter === 'Favoritos'
                ? 'bg-red-500/20 border-red-500 shadow-lg ring-1 ring-red-500'
                : 'bg-gray-800/60 border-gray-700/60 hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-red-400 uppercase font-semibold">
              <span>❤️</span> Favoritos
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.favoritos}</div>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en mi biblioteca por título, género o desarrolladora..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3.5 pl-10 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 transition shadow"
          />
          <span className="absolute left-3.5 top-3.5 text-gray-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold text-sm">{error}</span>
          </div>
          <button 
            type="button"
            onClick={() => setError('')} 
            className="text-red-400 hover:text-white font-bold text-lg px-2 transition"
          >
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24 text-gray-400 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          Cargando tu biblioteca...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-800">
          <div className="text-5xl mb-3">🎮</div>
          <p className="text-gray-400 text-lg mb-4">No se encontraron videojuegos en esta sección.</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const game = item.game;
            const currentStatus = item.status;
            const isFav = item.isFavorite;
            const isLoading = actionLoading === game._id;

            return (
              <div
                key={item._id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700/60 hover:border-gray-600 flex flex-col group transition"
              >
                <div className="relative h-44 overflow-hidden bg-gray-900">
                  <img
                    src={game.imageUrl || 'https://via.placeholder.com/300x150?text=Sin+Imagen'}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleToggleFavorite(game._id)}
                    disabled={isLoading}
                    aria-label="Alternar Favorito"
                    className="absolute top-2.5 right-2.5 bg-gray-900/80 hover:bg-gray-900 p-2 rounded-full text-lg shadow-lg transition-transform hover:scale-110"
                  >
                    {isFav ? '❤️' : '🤍'}
                  </button>

                  {currentStatus && STATUS_CONFIG[currentStatus] && (
                    <span className={`absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md ${STATUS_CONFIG[currentStatus].badge}`}>
                      <span>{STATUS_CONFIG[currentStatus].icon}</span>
                      <span>{currentStatus}</span>
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{game.title}</h3>
                  <div className="text-xs text-gray-400 mb-3 flex items-center justify-between">
                    <span>{game.genre?.name || 'Género'}</span>
                    <span>{game.developer?.name || 'Desarrolladora'}</span>
                  </div>

                  <div className="mt-auto space-y-2 pt-2 border-t border-gray-700/60">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Estado:</span>
                      <select
                        value={currentStatus || ''}
                        onChange={(e) => handleStatusChange(game._id, e.target.value)}
                        disabled={isLoading}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Sin Estado</option>
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Link
                        to={`/games/${game._id}`}
                        className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 rounded-lg text-xs transition"
                      >
                        Ver Detalle
                      </Link>
                      <button
                        onClick={() => handleRemove(game._id, game.title)}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-rose-400 p-1.5 text-xs transition"
                        title="Quitar de mi biblioteca"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Library;
