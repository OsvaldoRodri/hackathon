import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-management.css';
import { apiService, Usuario } from '../services/api';

const AdminUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<Usuario>>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    curp: '',
    rol: 'dueno',
    activo: true
  });

  // Verificar autenticación de admin
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!userToken || (userRole !== 'admin' && userRole !== 'tesorero')) {
      navigate('/login');
      return;
    }
    
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUsuarios();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        curp: user.curp,
        rol: user.rol,
        activo: user.activo
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        curp: '',
        rol: 'dueno',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      curp: '',
      rol: 'dueno',
      activo: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Actualizar usuario existente
        const response = await apiService.updateUsuario(editingUser.id, formData);
        if (response.success) {
          await loadUsers(); // Recargar la lista
          closeModal();
        } else {
          setError('Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        const response = await apiService.createUsuario({
          ...formData,
          password: 'temp123' // Password temporal que el usuario debe cambiar
        } as Partial<Usuario>);
        if (response.success) {
          await loadUsers(); // Recargar la lista
          closeModal();
        } else {
          setError('Error al crear usuario');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Error al guardar usuario');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const response = await apiService.toggleUsuarioStatus(userId);
      if (response.success) {
        await loadUsers(); // Recargar la lista
      } else {
        setError('Error al cambiar estado del usuario');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Error al cambiar estado del usuario');
    }
  };

  const deleteUser = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const response = await apiService.deleteUsuario(userId);
        if (response.success) {
          await loadUsers(); // Recargar la lista
        } else {
          setError('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Error al eliminar usuario');
      }
    }
  };

  const getActiveUsers = () => users.filter(u => u.activo).length;
  const getInactiveUsers = () => users.filter(u => !u.activo).length;
  const getUsersByRole = (role: string) => users.filter(u => u.rol === role).length;

  const getRoleDisplayName = (rol: string) => {
    switch (rol) {
      case 'dueno': return 'Dueño';
      case 'admin': return 'Administrador';
      case 'tesorero': return 'Tesorero';
      default: return rol;
    }
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Cargando usuarios...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Gestión de Usuarios</h1>
        <div className="admin-actions">
          <button 
            className="btn-primary" 
            onClick={() => openModal()}
          >
            + Nuevo Usuario
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/admin')}
          >
            Volver al Panel
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0',
          border: '1px solid #fcc'
        }}>
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usuarios</h3>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Usuarios Activos</h3>
          <p className="stat-value">{getActiveUsers()}</p>
        </div>
        <div className="stat-card">
          <h3>Usuarios Inactivos</h3>
          <p className="stat-value">{getInactiveUsers()}</p>
        </div>
        <div className="stat-card">
          <h3>Dueños</h3>
          <p className="stat-value">{getUsersByRole('dueno')}</p>
        </div>
        <div className="stat-card">
          <h3>Administradores</h3>
          <p className="stat-value">{getUsersByRole('admin')}</p>
        </div>
        <div className="stat-card">
          <h3>Tesoreros</h3>
          <p className="stat-value">{getUsersByRole('tesorero')}</p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>CURP</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{`${user.nombre} ${user.apellido}`}</td>
                <td>{user.email}</td>
                <td>{user.telefono}</td>
                <td>{user.curp}</td>
                <td>
                  <span className={`role-badge role-${user.rol}`}>
                    {getRoleDisplayName(user.rol)}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.activo ? 'status-active' : 'status-inactive'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>{new Date(user.fechaRegistro).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-edit"
                    onClick={() => openModal(user)}
                    title="Editar usuario"
                  >
                    ✏️
                  </button>
                  <button 
                    className={`btn-toggle ${user.activo ? 'btn-deactivate' : 'btn-activate'}`}
                    onClick={() => toggleUserStatus(user.id)}
                    title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                  >
                    {user.activo ? '🔒' : '🔓'}
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => deleteUser(user.id)}
                    title="Eliminar usuario"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre*</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="apellido">Apellido*</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="telefono">Teléfono*</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="curp">CURP*</label>
                  <input
                    type="text"
                    id="curp"
                    name="curp"
                    value={formData.curp || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rol">Rol*</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol || 'dueno'}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="dueno">Dueño</option>
                    <option value="admin">Administrador</option>
                    <option value="tesorero">Tesorero</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo || false}
                      onChange={handleInputChange}
                    />
                    Usuario Activo
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuarios;