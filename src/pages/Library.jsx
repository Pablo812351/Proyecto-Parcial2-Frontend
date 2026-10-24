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
      alert(error.response?.data?.message || 'No se pudo actualizar el estado del videojuego.');
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
      alert(error.response?.data?.message || 'Error al quitar el videojuego de la biblioteca.');
    } finally {
      setActionLoading(null);
    }
  };

  // Conteo de estadísticas
  const stats = {
    total: items.length,
    jugando: items.filter(i => i.status === 'Jugando').length,
    pendiente: items.filter(i => i.status === 'Pendiente').length,
    completado: items.filter(i => i.status === 'Completado').length,
    abandonado: items.filter(i => i.status === 'Abandonado').length,
    favoritos: items.filter(i => i.isFavorite).length
  };

  // Filtrado de elementos
  const filteredItems = items.filter(item => {
    if (!item.game) return false;

    // Filtro por pestaña de estado
    if (activeFilter === 'Favoritos' && !item.isFavorite) return false;
    if (activeFilter !== 'Todos' && activeFilter !== 'Favoritos' && item.status !== activeFilter) return false;

    // Filtro por texto de búsqueda
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
      {/* Header con título y resumen */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500">
              Mi Biblioteca Personal 📚
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Organiza, clasifica tus estados de juego y resguarda tus favoritos en un solo lugar.
            </p>
          </div>

          <Link
            to="/"
            className="self-start md:self-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
          >
            <span>+ Explorar Catálogo</span>
          </Link>
        </div>

        {/* Tarjetas de Estadísticas */}
        {/* Tarjetas de Estadísticas y Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div
            onClick={() => setActiveFilter('Todos')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Todos' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-gray-400 font-semibold">Total</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>

          <div
            onClick={() => setActiveFilter('Jugando')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Jugando' ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-emerald-400 font-semibold flex items-center gap-1">
              <span>▶️</span> Jugando
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.jugando}</div>
          </div>

          <div
            onClick={() => setActiveFilter('Pendiente')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Pendiente' ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-amber-400 font-semibold flex items-center gap-1">
              <span>⏳</span> Pendiente
            </div>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.pendiente}</div>
          </div>

          <div
            onClick={() => setActiveFilter('Completado')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Completado' ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-blue-400 font-semibold flex items-center gap-1">
              <span>🏆</span> Completado
            </div>
            <div className="text-2xl font-bold text-blue-300 mt-1">{stats.completado}</div>
          </div>

          <div
            onClick={() => setActiveFilter('Abandonado')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Abandonado' ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-rose-400 font-semibold flex items-center gap-1">
              <span>⛔</span> Abandonado
            </div>
            <div className="text-2xl font-bold text-rose-300 mt-1">{stats.abandonado}</div>
          </div>

          <div
            onClick={() => setActiveFilter('Favoritos')}
            className={`p-3 rounded-xl bg-gray-800/80 border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${activeFilter === 'Favoritos' ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="text-xs uppercase text-pink-400 font-semibold flex items-center gap-1">
              <span>❤️</span> Favoritos
            </div>
            <div className="text-2xl font-bold text-pink-300 mt-1">{stats.favoritos}</div>
          </div>
        </div>

        {/* Buscador interno */}
        <div className="flex justify-end mt-6">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar en mi biblioteca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm shadow-md transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center py-24 text-gray-400 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          Cargando tu biblioteca...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/60 p-12 text-center max-w-xl mx-auto my-12">
          <div className="text-6xl mb-4">
            {activeFilter === 'Favoritos' ? '💔' : '🎮'}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {searchQuery
              ? 'No se encontraron coincidencias'
              : activeFilter === 'Todos'
                ? 'Tu biblioteca está vacía'
                : `No tienes juegos en "${activeFilter}"`}
          </h3>
          <p className="text-gray-400 mb-6 text-sm">
            {searchQuery
              ? `No encontramos juegos en tu biblioteca con "${searchQuery}".`
              : 'Explora nuestro catálogo y comienza a clasificar tus juegos por estado (Pendiente, Jugando, Completado o Abandonado).'}
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg transition"
          >
            Ir al Catálogo de Juegos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(({ game, status, isFavorite }) => {
            const statusInfo = status ? (STATUS_CONFIG[status] || STATUS_CONFIG['Pendiente']) : {
              badge: 'bg-gray-700/80 text-gray-300 border border-gray-600',
              dot: 'bg-gray-400',
              icon: '⚪',
              label: isFavorite ? '❤️ En Favoritos' : 'Sin clasificar'
            };
            const isLoadingThis = actionLoading === game._id;

            return (
              <div
                key={game._id}
                className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/60 shadow-xl flex flex-col group hover:border-gray-500 transition-all duration-300"
              >
                {/* Portada del juego */}
                <div className="relative h-44 overflow-hidden bg-gray-900">
                  <img
                    src={game.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Botón Favorito Flotante */}
                  <button
                    onClick={() => handleToggleFavorite(game._id)}
                    disabled={isLoadingThis}
                    title={isFavorite ? 'Quitar de Favoritos' : 'Marcar como Favorito'}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${isFavorite
                      ? 'bg-red-500/90 text-white hover:bg-red-600 scale-110'
                      : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/80'
                      }`}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  {/* Badge de Género */}
                  <span className="absolute bottom-2.5 left-2.5 bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-700">
                    {game.genre?.name || 'Género'}
                  </span>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-3">
                    <h2 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {game.title}
                    </h2>
                    <p className="text-gray-400 text-xs truncate">
                      {game.developer?.name || 'Desarrollador no especificado'}
                    </p>
                  </div>

                  {/* Selector interactivo de Estado */}
                  <div className="mt-auto mb-4 bg-gray-900/70 p-3 rounded-xl border border-gray-700/60">
                    <label className="text-xs text-gray-400 block mb-1.5 font-medium flex items-center justify-between">
                      <span>Estado:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.label}
                      </span>
                    </label>

                    <select
                      value={status || ''}
                      disabled={isLoadingThis}
                      onChange={(e) => handleStatusChange(game._id, e.target.value)}
                      className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">⚪ Sin clasificar (Opcional)</option>
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {STATUS_CONFIG[st].icon} {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="flex gap-2 items-center">
                    <Link
                      to={`/games/${game._id}`}
                      className="flex-1 text-center bg-gray-700 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      Detalles
                    </Link>

                    <button
                      onClick={() => handleRemove(game._id, game.title)}
                      disabled={isLoadingThis}
                      title="Eliminar de mi biblioteca"
                      className="bg-gray-700/50 hover:bg-red-600/80 text-gray-400 hover:text-white p-2 rounded-lg transition-colors text-sm"
                    >
                      🗑️
                    </button>
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
