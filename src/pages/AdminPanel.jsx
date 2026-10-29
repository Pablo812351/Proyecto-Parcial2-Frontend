import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('games'); // 'games' | 'users'
  const [games, setGames] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const editIdFromUrl = searchParams.get('edit');

  // Estados de formulario de juegos
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del modal de confirmación unificado
  const [confirmModalConfig, setConfirmModalConfig] = useState(null);

  const [formData, setFormData] = useState({
    title: '', description: '', steamUrl: '', imageUrl: '', genreName: '', developerName: '', releaseDate: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN_ROLE') {
      navigate('/');
      return;
    }

    fetchGames();
    fetchUsers();
  }, [user, navigate]);

  // Si viene con parámetro ?edit=<id>, abrir automáticamente la edición del juego
  useEffect(() => {
    if (editIdFromUrl && games.length > 0) {
      const targetGame = games.find(g => g._id === editIdFromUrl);
      if (targetGame) {
        startEdit(targetGame);
        setSearchParams({}, { replace: true });
        setActiveTab('games');
      }
    }
  }, [editIdFromUrl, games]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/games');
      setGames(data);
    } catch (error) {
      console.error('Error al cargar videojuegos:', error);
      setError(error.response?.data?.message || 'Error al cargar videojuegos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.get('/api/users', config);
      setUsersList(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.message || 'Error al cargar usuarios.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filtrado de juegos
  const filteredGames = games.filter(game => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const titleMatch = game.title?.toLowerCase().includes(term);
    const genreMatch = game.genre?.name?.toLowerCase().includes(term);
    const devMatch = game.developer?.name?.toLowerCase().includes(term);
    return titleMatch || genreMatch || devMatch;
  });

  // Filtrado de usuarios
  const filteredUsers = usersList.filter(u => {
    if (!userSearchTerm.trim()) return true;
    const term = userSearchTerm.toLowerCase().trim();
    return (
      u.username?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  // Cantidad de administradores activos en el sistema
  const adminCount = usersList.filter(u => u.role === 'ADMIN_ROLE').length;

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', steamUrl: '', imageUrl: '', genreName: '', developerName: '', releaseDate: '' });
    setShowForm(false);
  };

  // --- Operaciones de Videojuegos con ConfirmModal ---
  const handleDeleteGameClick = (game) => {
    setConfirmModalConfig({
      title: '¿Eliminar videojuego del catálogo?',
      message: `¿Estás seguro de que deseas eliminar permanentemente "${game.title}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, Eliminar',
      danger: true,
      onConfirm: async () => {
        setConfirmModalConfig(null);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await api.delete(`/api/games/${game._id}`, config);
          setSuccess('¡Videojuego eliminado correctamente!');
          setGames(prev => prev.filter(g => g._id !== game._id));
        } catch (error) {
          console.error('Error al eliminar juego:', error);
          setError(error.response?.data?.message || 'Error al eliminar el videojuego.');
        }
      }
    });
  };

  // --- Operaciones de Usuarios con ConfirmModal ---
  const handleRoleToggleClick = (targetUser) => {
    setError('');
    setSuccess('');
    const isPromoting = targetUser.role === 'USER_ROLE';
    const newRole = isPromoting ? 'ADMIN_ROLE' : 'USER_ROLE';

    // Regla de seguridad: Si solo hay un admin y se le quiere quitar el admin
    if (!isPromoting && adminCount <= 1) {
      setError('No es posible quitar el rol de administrador porque es el único administrador del sistema.');
      return;
    }

    setConfirmModalConfig({
      title: isPromoting ? '¿Hacer Administrador?' : '¿Quitar rol de Administrador?',
      message: isPromoting
        ? `¿Estás seguro de que deseas ascender a "${targetUser.username}" a Administrador? Tendrá control total sobre el catálogo y usuarios.`
        : `¿Estás seguro de que deseas revocar los permisos de Administrador a "${targetUser.username}"? Pasará a ser un usuario estándar.`,
      confirmText: isPromoting ? 'Sí, Hacer Admin' : 'Sí, Quitar Admin',
      danger: !isPromoting,
      onConfirm: async () => {
        setConfirmModalConfig(null);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await api.put(`/api/users/${targetUser._id}/role`, { role: newRole }, config);
          setSuccess(data.message || 'Rol de usuario actualizado correctamente.');
          setUsersList(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
        } catch (err) {
          console.error('Error al actualizar rol:', err);
          setError(err.response?.data?.message || 'Error al actualizar el rol del usuario.');
        }
      }
    });
  };

  const handleDeleteUserClick = (targetUser) => {
    setError('');
    setSuccess('');

    // Regla de seguridad: No se puede eliminar al único administrador
    if (targetUser.role === 'ADMIN_ROLE' && adminCount <= 1) {
      setError('No es posible eliminar al único administrador del sistema.');
      return;
    }

    const isSelf = targetUser._id === user?._id;

    setConfirmModalConfig({
      title: '¿Eliminar cuenta de usuario?',
      message: isSelf
        ? `¡ATENCIÓN! Estás a punto de eliminar tu propia cuenta ("${targetUser.username}"). Esta acción cerrará tu sesión permanentemente.`
        : `¿Estás seguro de que deseas eliminar permanentemente la cuenta de "${targetUser.username}" (${targetUser.email})? Se borrará su cuenta y toda su biblioteca personal.`,
      confirmText: 'Sí, Eliminar Cuenta',
      danger: true,
      onConfirm: async () => {
        setConfirmModalConfig(null);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await api.delete(`/api/users/${targetUser._id}`, config);
          setSuccess(data.message || 'Usuario eliminado correctamente.');
          setUsersList(prev => prev.filter(u => u._id !== targetUser._id));
          if (isSelf) {
            logout();
            navigate('/login');
          }
        } catch (err) {
          console.error('Error al eliminar usuario:', err);
          setError(err.response?.data?.message || 'Error al eliminar la cuenta del usuario.');
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-4 mt-8 animate-fade-in max-w-6xl">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Panel de Administración</span>
        </h1>
        {activeTab === 'games' && (
          <button 
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-lg flex items-center gap-1.5 self-end sm:self-auto"
          >
            <span>{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Ocultar Formulario' : 'Nuevo Videojuego'}</span>
          </button>
        )}
      </header>

      {/* Selector de Pestañas: Videojuegos vs Usuarios */}
      <div className="flex border-b border-gray-700/80 mb-6 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('games');
            setError('');
          }}
          className={`pb-3 px-3 sm:px-4 font-bold text-sm sm:text-base transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'games'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>🎮</span>
          <span>Catálogo de Videojuegos</span>
          <span className="text-xs bg-gray-700/80 px-2 py-0.5 rounded-full text-gray-300">
            {games.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            setError('');
            if (usersList.length === 0) fetchUsers();
          }}
          className={`pb-3 px-3 sm:px-4 font-bold text-sm sm:text-base transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <span>👥</span>
          <span>Gestión de Usuarios</span>
          <span className="text-xs bg-gray-700/80 px-2 py-0.5 rounded-full text-gray-300">
            {usersList.length}
          </span>
        </button>
      </div>

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

      {/* PESTAÑA 1: GESTIÓN DE VIDEOJUEGOS */}
      {activeTab === 'games' && (
        <div>
          {showForm && (
            <div className="mb-8 space-y-4 animate-fade-in">
              <form onSubmit={handleCreateOrEdit} className="bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-2">
                  {editingId ? 'Editar Videojuego' : 'Registrar Nuevo Videojuego'}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" placeholder="Título del Videojuego" required
                    className="p-3 w-full sm:w-2/3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  <input 
                    type="date" required
                    min="1950-01-01"
                    max="2036-12-31"
                    className="p-3 w-full sm:w-1/3 bg-gray-700 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition"
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
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-lg"
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
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-md transition"
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
                      className="mt-4 text-blue-400 hover:text-blue-300 underline text-sm"
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
                                onClick={() => handleDeleteGameClick(game)}
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
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
              <input 
                type="text"
                placeholder="Buscar por usuario o email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm shadow-md transition"
              />
              {userSearchTerm && (
                <button 
                  type="button"
                  onClick={() => setUserSearchTerm('')}
                  aria-label="Limpiar búsqueda de usuarios"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-xs font-semibold text-gray-400 text-right sm:text-left">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
              {userSearchTerm && ` (filtrado de ${usersList.length})`}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
            {loadingUsers ? (
              <div className="flex justify-center items-center py-24 text-gray-400 text-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mr-3"></div>
                Cargando usuarios del sistema...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-2">👥</div>
                <p className="font-semibold text-white">No se encontraron usuarios</p>
                <p className="text-sm text-gray-400 mt-1">No hay resultados para "{userSearchTerm}".</p>
                <button 
                  onClick={() => setUserSearchTerm('')}
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
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Correo Electrónico</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Fecha de Registro</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map(u => {
                      const isSelf = u._id === user?._id;
                      const isOnlyAdmin = u.role === 'ADMIN_ROLE' && adminCount <= 1;

                      return (
                        <tr key={u._id} className="hover:bg-gray-700/50 transition">
                          <td className="p-4 font-bold text-white flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              u.role === 'ADMIN_ROLE'
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                                : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                            }`}>
                              {u.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[140px] sm:max-w-none">{u.username}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-normal shrink-0">
                                Tú
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-300">{u.email}</td>
                          <td className="p-4">
                            {u.role === 'ADMIN_ROLE' ? (
                              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                                <span>👑</span>
                                <span>Administrador</span>
                              </span>
                            ) : (
                              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                                <span>👤</span>
                                <span>Usuario</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-AR', {
                              timeZone: 'UTC',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="p-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleRoleToggleClick(u)}
                              disabled={isOnlyAdmin}
                              title={isOnlyAdmin ? 'Es el único administrador del sistema' : (u.role === 'ADMIN_ROLE' ? 'Quitar rol de Administrador' : 'Ascender a Administrador')}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
                                isOnlyAdmin
                                  ? 'bg-gray-700 text-gray-500 border border-gray-600/50 cursor-not-allowed opacity-50'
                                  : u.role === 'ADMIN_ROLE'
                                  ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 shadow-sm'
                                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                              }`}
                            >
                              <span>{u.role === 'ADMIN_ROLE' ? (isOnlyAdmin ? '🔒 Único Admin' : '👤 Quitar Admin') : '👑 Hacer Admin'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUserClick(u)}
                              disabled={isOnlyAdmin}
                              title={isOnlyAdmin ? 'No se puede eliminar al único administrador' : 'Eliminar cuenta de usuario'}
                              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
                                isOnlyAdmin
                                  ? 'bg-gray-700 text-gray-500 border border-gray-600/50 cursor-not-allowed opacity-50'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20'
                              }`}
                            >
                              <span>🗑️ Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación genérico para todas las operaciones (Juegos y Usuarios) */}
      <ConfirmModal
        isOpen={Boolean(confirmModalConfig)}
        title={confirmModalConfig?.title}
        message={confirmModalConfig?.message}
        confirmText={confirmModalConfig?.confirmText || 'Confirmar'}
        cancelText={confirmModalConfig?.cancelText || 'Cancelar'}
        danger={confirmModalConfig?.danger !== false}
        onCancel={() => setConfirmModalConfig(null)}
        onConfirm={confirmModalConfig?.onConfirm}
      />
    </div>
  );
}

export default AdminPanel;
