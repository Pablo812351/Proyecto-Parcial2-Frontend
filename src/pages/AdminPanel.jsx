import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

function AdminPanel() {
  const [games, setGames] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    try {
      const { data } = await api.get('/api/games');
      setGames(data);
    } catch (error) {
      console.error("Error fetching games", error);
    }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (editingId) {
        await api.put(`/api/games/${editingId}`, formData, config);
      } else {
        await api.post('/api/games', formData, config);
      }
      
      resetForm();
      fetchGames();
    } catch (error) {
      console.error("Error guardando juego", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const startEdit = (game) => {
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
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', steamUrl: '', imageUrl: '', genreName: '', developerName: '', releaseDate: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este juego?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await api.delete(`/api/games/${id}`, config);
        fetchGames();
      } catch (error) {
        console.error("Error eliminando juego", error);
        alert("Error al eliminar el juego: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-4 mt-10">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">⚙️ Panel de Administración</h1>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Ocultar Formularios' : '+ Gestionar Catálogo'}
        </button>
      </header>

      {showForm && (
        <div className="mb-8 space-y-4">
          <form onSubmit={handleCreateOrEdit} className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white mb-2">{editingId ? 'Editar Juego' : 'Crear Nuevo Juego'}</h2>
            <div className="flex gap-4">
              <input 
                type="text" placeholder="Título" required
                className="p-3 w-2/3 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <input 
                type="date" required title="Fecha de Lanzamiento"
                className="p-3 w-1/3 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.releaseDate} onChange={e => setFormData({...formData, releaseDate: e.target.value})}
              />
            </div>
            <textarea 
              placeholder="Descripción" required
              className="p-3 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />
            <div className="flex gap-4">
              <input 
                type="text" placeholder="Nombre del Género (Ej: RPG)" required
                className="p-3 w-1/2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.genreName} onChange={e => setFormData({...formData, genreName: e.target.value})}
              />
              <input 
                type="text" placeholder="Nombre de la Empresa (Ej: Valve)" required
                className="p-3 w-1/2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.developerName} onChange={e => setFormData({...formData, developerName: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <input 
                type="text" placeholder="URL de Imagen" required
                className="p-3 w-1/2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
              <input 
                type="text" placeholder="URL de Steam"
                className="p-3 w-1/2 bg-gray-700 text-white rounded outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.steamUrl} onChange={e => setFormData({...formData, steamUrl: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded mt-2">
              {editingId ? 'Actualizar Juego' : 'Guardar Juego'}
            </button>
          </form>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-700 text-gray-400">
            <tr>
              <th className="p-4 font-semibold">Título</th>
              <th className="p-4 font-semibold">Género</th>
              <th className="p-4 font-semibold">Desarrollador</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game._id} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                <td className="p-4 font-medium text-white">{game.title}</td>
                <td className="p-4">{game.genre?.name || '---'}</td>
                <td className="p-4">{game.developer?.name || '---'}</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => startEdit(game)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(game._id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">No hay juegos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
