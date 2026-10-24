import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const STATUS_CONFIG = {
  'Jugando': { badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40', icon: '▶️' },
  'Pendiente': { badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40', icon: '⏳' },
  'Completado': { badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/40', icon: '🏆' },
  'Abandonado': { badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/40', icon: '⛔' }
};

const ALL_STATUSES = ['Pendiente', 'Jugando', 'Completado', 'Abandonado'];

function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState('Pendiente');
  const [loadingAction, setLoadingAction] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setError(null);
        const { data } = await api.get(`/api/games/${id}`);
        setGame(data);
      } catch (err) {
        console.error("Error fetching game", err);
        setError(err.response?.data?.message || "Videojuego no encontrado");
      }
    };

    const checkLibraryAndFavorite = async () => {
      if (user) {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await api.get(`/api/library/check/${id}`, config);
          if (data.inLibrary && data.item) {
            setInLibrary(true);
            setLibraryStatus(data.item.status || '');
            setIsFavorite(data.item.isFavorite);
          } else {
            // Revisar también en favoritos por si acaso
            const favRes = await api.get('/api/auth/favorites', config);
            const isFav = favRes.data.some(fav => fav._id === id);
            setIsFavorite(isFav);
            if (isFav) setInLibrary(true);
          }
        } catch (error) {
          console.error("Error checking library status", error);
        }
      }
    };

    fetchGame();
    checkLibraryAndFavorite();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) return alert("Debes iniciar sesión para marcar favoritos.");
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post(`/api/library/toggle-favorite/${id}`, {}, config);
      setIsFavorite(data.isFavorite);
      if (data.item) {
        setInLibrary(true);
        setLibraryStatus(data.item.status || '');
      } else if (!data.isFavorite && !libraryStatus) {
        setInLibrary(false);
      }
    } catch (error) {
      console.error("Error toggling favorite", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddToLibrary = async (statusToSet = '') => {
    if (!user) return alert("Debes iniciar sesión para gestionar tu biblioteca.");
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.post('/api/library', {
        gameId: id,
        status: statusToSet || null,
        isFavorite
      }, config);
      setInLibrary(true);
      setLibraryStatus(data.status || '');
    } catch (error) {
      console.error("Error al agregar a biblioteca:", error);
      alert(error.response?.data?.message || "Error al agregar el videojuego a tu biblioteca.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put(`/api/library/${id}`, {
        status: newStatus
      }, config);
      setLibraryStatus(data.status);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert(error.response?.data?.message || "No se pudo actualizar el estado del videojuego.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!window.confirm("¿Seguro que deseas quitar este juego de tu biblioteca personal?")) return;
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/api/library/${id}`, config);
      setInLibrary(false);
    } catch (error) {
      console.error("Error al quitar de biblioteca:", error);
      alert(error.response?.data?.message || "No se pudo quitar el videojuego de la biblioteca.");
    } finally {
      setLoadingAction(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-xl text-center py-24 animate-fade-in">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-3xl font-extrabold text-white mb-2">Videojuego no encontrado</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <Link 
          to="/" 
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          ← Volver al Catálogo
        </Link>
      </div>
    );
  }

  if (!game) return (
    <div className="flex justify-center items-center py-32 text-gray-400 text-xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
      Cargando juego...
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-6 animate-fade-in">
      <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/60 flex flex-col md:flex-row">
        {/* Imagen del Juego */}
        <div className="md:w-1/2 relative bg-gray-950 flex items-center justify-center min-h-[350px]">
          <img 
            src={game.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={game.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 md:hidden" />
        </div>

        {/* Detalles del Juego */}
        <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {game.title}
              </h1>
              <button 
                onClick={toggleFavorite}
                disabled={loadingAction}
                title={isFavorite ? "Quitar de Favoritos" : "Marcar como Favorito"}
                className={`p-3 rounded-2xl transition-all shadow-md ${
                  isFavorite 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 scale-105' 
                    : 'bg-gray-700/60 text-gray-400 border border-gray-600 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-600/80 border border-blue-400/30 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                📁 {game.genre?.name || 'Género'}
              </span>
              <span className="bg-purple-600/80 border border-purple-400/30 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                🏢 {game.developer?.name || 'Desarrollador'}
              </span>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
              {game.description}
            </p>
            
            <div className="text-gray-400 text-xs md:text-sm mb-6 pb-6 border-b border-gray-700/60">
              <span className="text-gray-300 font-medium">Fecha de Lanzamiento: </span> 
              {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'Desconocida'}
            </div>
          </div>

          {/* Sección de Gestión en Biblioteca Personal */}
          <div className="bg-gray-900/80 p-5 rounded-2xl border border-gray-700/70 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <span>📚</span> Mi Biblioteca Personal
              </h3>
              {inLibrary && (
                libraryStatus ? (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_CONFIG[libraryStatus]?.badge}`}>
                    {STATUS_CONFIG[libraryStatus]?.icon} {libraryStatus}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gray-700/80 text-gray-300 border border-gray-600">
                    {isFavorite ? '❤️ En Favoritos' : 'Sin clasificar'}
                  </span>
                )
              )}
            </div>

            {user ? (
              inLibrary ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Clasificar estado de juego (Opcional):</label>
                    <select
                      value={libraryStatus || ''}
                      disabled={loadingAction}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full bg-gray-800 text-white text-sm rounded-xl px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">⚪ Sin clasificar (Solo en Biblioteca / Favorito)</option>
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {STATUS_CONFIG[st].icon} {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      to="/library"
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      Ver en Mi Biblioteca →
                    </Link>
                    <button
                      onClick={handleRemoveFromLibrary}
                      disabled={loadingAction}
                      className="text-xs text-red-400 hover:text-red-300 font-medium hover:underline"
                    >
                      Quitar de la biblioteca
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleAddToLibrary('')}
                    disabled={loadingAction}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm shadow-md transition-all hover:scale-[1.02]"
                  >
                    + Agregar a mi Biblioteca
                  </button>
                </div>
              )
            ) : (
              <p className="text-xs text-gray-400">
                <Link to="/login" className="text-blue-400 hover:underline font-semibold">Inicia sesión</Link> para clasificar este juego en tu biblioteca personal (Pendiente, Jugando, Completado o Abandonado).
              </p>
            )}
          </div>

          {/* Enlace externo a Steam */}
          {game.steamUrl && (
            <a 
              href={game.steamUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Ver en Steam Store ↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
