import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

function AdminPanel() {
  const [games, setGames] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const editIdFromUrl = searchParams.get('edit');

  useEffect(() => {
    if (editIdFromUrl && games.length > 0) {
      const targetGame = games.find(g => g._id === editIdFromUrl);
      if (targetGame) {
        startEdit(targetGame);
        setSearchParams({}, { replace: true });
      }
    }
  }, [editIdFromUrl, games]);

  const filteredGames = games.filter(game => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const titleMatch = game.title?.toLowerCase().includes(term);
    const genreMatch = game.genre?.name?.toLowerCase().includes(term);
    const devMatch = game.developer?.name?.toLowerCase().includes(term);
    return titleMatch || genreMatch || devMatch;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', steamUrl: '', imageUrl: '', genreName: '', developerName: '', releaseDate: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN_ROLE') {
      navigate('/');
      return;
    }

    fetchGames();
  }, [user, navigate]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/games');
      setGames(data);
    } catch (error) {
      console.error('Error al cargar videojuegos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.developerName.trim() || !formData.genreName.trim() || !formData.imageUrl.trim()) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    // Validar duplicados de título en el cliente antes de enviar
    const cleanTitle = formData.title.trim().toLowerCase();
    const isDuplicate = games.some(g => 
      g._id !== editingId && g.title.trim().toLowerCase() === cleanTitle
    );
    if (isDuplicate) {
      setError('Ya existe un videojuego registrado con ese título. Por favor elija otro.');
      return;
    }

    if (formData.releaseDate) {
      const selectedYear = new Date(formData.releaseDate).getUTCFullYear();
      const maxYear = new Date().getFullYear() + 10;
      if (isNaN(selectedYear) || selectedYear < 1950 || selectedYear > maxYear) {
        setError(`El año de lanzamiento debe estar comprendido entre 1950 y ${maxYear}.`);
      return;
      }
    }

    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (editingId) {
        await api.put(`/api/games/${editingId}`, formData, config);
      } else {
        await api.post('/api/games', formData, config);
      }
      
      setSuccess(editingId ? '¡Videojuego actualizado correctamente!' : '¡Videojuego registrado correctamente!');
      resetForm();
      fetchGames();
    } catch (error) {
      console.error('Error al guardar videojuego:', error);
      setError(error.response?.data?.message || 'Error al guardar el videojuego.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (game) => {
    setError('');
    setSuccess('');
    setEditingId(game._id);
    setFormData({
      title: game.title,
      description: game.description,
      steamUrl: game.steamUrl || '',
      imageUrl: game.imageUrl || '',
      genreName: game.genre?.name || '',
      developerName: game.developer?.name || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', steamUrl: '', imageUrl: '', genreName: '', developerName: '', releaseDate: '' });
  };

  const handleDeleteClick = (game) => {
    setDeleteTarget(game);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.delete(`/api/games/${deleteTarget._id}`, config);
      setSuccess(`Videojuego "${deleteTarget.title}" eliminado correctamente.`);
      fetchGames();
    } catch (error) {
      console.error("Error al eliminar videojuego:", error);
      setError(error.response?.data?.message || 'Error al eliminar el videojuego.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-8 animate-fade-in">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Panel de Administración</span>
        </h1>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-lg flex items-center gap-1.5"
        >
          <span>{showForm ? '✕' : '+'}</span>
          <span>{showForm ? 'Ocultar Formulario' : 'Nuevo Videojuego'}</span>
        </button>
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

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="font-semibold text-sm">{success}</span>
          </div>
          <button 
            type="button"
            onClick={() => setSuccess('')} 
            className="text-emerald-400 hover:text-white font-bold text-lg px-2 transition"
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-8 space-y-4 animate-fade-in">
          <form onSubmit={handleCreateOrEdit} className="bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-2">
              {editingId ? 'Editar Videojuego' : 'Registrar Nuevo Videojuego'}
            </h2>
            <div className="flex gap-4">
              <input 
                type="text" placeholder="Título del Videojuego" required
                className="p-3 w-2/3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <input 
                type="date" required
                min="1950-01-01"
                max="2036-12-31"
                className="p-3 w-1/3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})}
              />
            </div>

            <textarea 
              placeholder="Descripción del Videojuego" required rows="3"
              className="p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Género (ej. RPG, Acción)" required
                className="p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.genreName} onChange={e => setFormData({...formData, genreName: e.target.value})}
              />
              <input 
                type="text" placeholder="Empresa Desarrolladora (ej. Valve, Nintendo)" required
                className="p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.developerName} onChange={e => setFormData({...formData, developerName: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="url" placeholder="URL de la Imagen de Portada" required
                className="p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
              <input 
                type="url" placeholder="URL de Steam (opcional)"
                className="p-3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                value={formData.steamUrl} onChange={e => setFormData({...formData, steamUrl: e.target.value})}
              />
            </div>

            <div className="flex gap-4 mt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  editingId ? 'Actualizar Videojuego' : 'Crear Videojuego'
                )}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-24 text-gray-400 text-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          Cargando catálogo para administración...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
              <input 
                type="text"
                placeholder="Buscar por título, género o desarrolladora..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm shadow-md transition"
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-xs font-semibold text-gray-400 text-right sm:text-left">
              {filteredGames.length} {filteredGames.length === 1 ? 'juego' : 'juegos'}
              {searchTerm && ` (filtrado de ${games.length})`}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            {filteredGames.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-2">🔍</div>
                <p className="font-semibold text-white">No se encontraron videojuegos</p>
                <p className="text-sm text-gray-400 mt-1">No hay resultados para "{searchTerm}".</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-purple-400 hover:text-purple-300 underline text-sm"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-300">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Portada</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Género</th>
                      <th className="p-4">Desarrolladora</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredGames.map(game => (
                      <tr key={game._id} className="hover:bg-gray-700/50 transition">
                        <td className="p-4">
                          <img 
                            src={game.imageUrl || 'https://via.placeholder.com/60?text=Sin+Img'} 
                            alt={game.title} 
                            className="w-14 h-14 object-cover rounded-lg shadow"
                          />
                        </td>
                        <td className="p-4 font-bold text-white">{game.title}</td>
                        <td className="p-4">{game.genre?.name || 'N/A'}</td>
                        <td className="p-4">{game.developer?.name || 'N/A'}</td>
                        <td className="p-4 text-center space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => startEdit(game)}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(game)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg text-sm transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="¿Eliminar videojuego del catálogo?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default AdminPanel;
