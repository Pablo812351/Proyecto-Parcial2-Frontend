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
        console.error("Error al obtener videojuego:", err);
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
            const favRes = await api.get('/api/auth/favorites', config);
            const isFav = favRes.data.some(fav => fav._id === id);
            setIsFavorite(isFav);
            if (isFav) setInLibrary(true);
          }
        } catch (err) {
          console.error("Error al verificar estado en biblioteca:", err);
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
    } catch (err) {
      console.error("Error al alternar favorito:", err);
      alert(err.response?.data?.message || "No se pudo actualizar el estado de favorito.");
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
    } catch (err) {
      console.error("Error al agregar a biblioteca:", err);
      alert(err.response?.data?.message || "Error al agregar el videojuego a tu biblioteca.");
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
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert(err.response?.data?.message || "No se pudo actualizar el estado del videojuego.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveFromLibrary = async () => {
    if (!window.confirm("¿Seguro que deseas quitar este videojuego de tu biblioteca personal?")) return;
    try {
      setLoadingAction(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/api/library/${id}`, config);
      setInLibrary(false);
      setLibraryStatus('');
    } catch (err) {
      console.error("Error al quitar de biblioteca:", err);
      alert(err.response?.data?.message || "No se pudo quitar el videojuego de la biblioteca.");
    } finally {
      setLoadingAction(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-xl text-center py-24 animate-fade-in">
        <div className="text-6xl mb-4">🎮</div>
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
      Cargando detalle del juego...
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-6 animate-fade-in">
      <Link to="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-flex items-center gap-1.5 transition">
        ← Volver al Catálogo
      </Link>

      <div className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/60 flex flex-col md:flex-row">
        <div className="md:w-1/2 relative min-h-[350px]">
          <img 
            src={game.imageUrl || 'https://via.placeholder.com/600x400?text=Sin+Imagen'} 
            alt={game.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={toggleFavorite}
            disabled={loadingAction}
            aria-label="Favorito"
            className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-900 p-3 rounded-full text-2xl transition-transform hover:scale-110 shadow-lg"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="p-8 md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-semibold">
                {game.genre?.name || 'Género no especificado'}
              </span>
              {inLibrary && libraryStatus && STATUS_CONFIG[libraryStatus] && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${STATUS_CONFIG[libraryStatus].badge}`}>
                  <span>{STATUS_CONFIG[libraryStatus].icon}</span>
                  <span>{libraryStatus}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{game.title}</h1>
            <p className="text-gray-300 leading-relaxed mb-6">{game.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
              <div>
                <span className="block text-gray-500 font-medium">Desarrolladora:</span>
                <span className="text-white font-semibold">{game.developer?.name || 'Desconocido'}</span>
              </div>
              <div>
                <span className="block text-gray-500 font-medium">Lanzamiento:</span>
                <span className="text-white font-semibold">
                  {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('es-AR') : 'Sin fecha'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-700/60">
            {user ? (
              inLibrary ? (
                <div className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Estado en tu Biblioteca:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {ALL_STATUSES.map(status => {
                      const active = libraryStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={loadingAction}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                            active 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                              : 'bg-gray-700/60 border-gray-600/60 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <span>{STATUS_CONFIG[status]?.icon}</span>
                          <span>{status}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleRemoveFromLibrary}
                    disabled={loadingAction}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline pt-1 inline-block transition"
                  >
                    Quitar de mi biblioteca personal
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAddToLibrary('Pendiente')}
                    disabled={loadingAction}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>📚</span>
                    <span>Agregar a mi Biblioteca</span>
                  </button>
                </div>
              )
            ) : (
              <p className="text-sm text-gray-400 bg-gray-900/60 p-3 rounded-lg text-center">
                <Link to="/login" className="text-blue-400 hover:underline font-semibold">Inicia sesión</Link> para agregarlo a tu biblioteca personal.
              </p>
            )}

            {game.steamUrl && (
              <a 
                href={game.steamUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#1b2838] hover:bg-[#2a475e] text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 border border-gray-700"
              >
                <span>🛒</span>
                <span>Ver en la Tienda de Steam</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;
