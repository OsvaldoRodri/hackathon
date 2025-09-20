import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin-management.css';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'usuario' | 'admin' | 'tesorero';
  address: string;
  registeredAt: string;
  lastLogin: string;
  status: 'activo' | 'inactivo';
  paymentStatus: 'al_dia' | 'pendiente' | 'atrasado';
}

const AdminUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    role: 'usuario',
    address: '',
    status: 'activo',
    paymentStatus: 'al_dia'
  });

  // Verificar autenticación de admin
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!userToken || (userRole !== 'admin' && userRole !== 'tesorero')) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Cargar datos de usuarios iniciales
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'María González',
        email: 'maria.gonzalez@email.com',
        phone: '555-0101',
        role: 'usuario',
        address: 'Calle Principal 123, Colonia Centro',
        registeredAt: '2024-01-15',
        lastLogin: '2024-01-20',
        status: 'activo',
        paymentStatus: 'al_dia'
      },
      {
        id: 2,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '555-0102',
        role: 'usuario',
        address: 'Avenida Secundaria 456, Colonia Norte',
        registeredAt: '2024-01-10',
        lastLogin: '2024-01-18',
        status: 'activo',
        paymentStatus: 'pendiente'
      },
      {
        id: 3,
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        phone: '555-0103',
        role: 'usuario',
        address: 'Boulevard Oeste 789, Colonia Sur',
        registeredAt: '2024-01-08',
        lastLogin: '2024-01-15',
        status: 'activo',
        paymentStatus: 'atrasado'
      },
      {
        id: 4,
        name: 'Luis Herrera',
        email: 'luis.herrera@email.com',
        phone: '555-0104',
        role: 'usuario',
        address: 'Calle Lateral 321, Colonia Este',
        registeredAt: '2024-01-05',
        lastLogin: '2024-01-12',
        status: 'inactivo',
        paymentStatus: 'atrasado'
      },
      {
        id: 5,
        name: 'Sofia Jiménez',
        email: 'sofia.jimenez@email.com',
        phone: '555-0105',
        role: 'tesorero',
        address: 'Plaza Central 654, Colonia Administrativa',
        registeredAt: '2024-01-01',
        lastLogin: '2024-01-20',
        status: 'activo',
        paymentStatus: 'al_dia'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'usuario',
        address: '',
        status: 'activo',
        paymentStatus: 'al_dia'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'usuario',
      address: '',
      status: 'activo',
      paymentStatus: 'al_dia'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar usuario existente
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData } as User
          : user
      ));
    } else {
      // Agregar nuevo usuario
      const newUser: User = {
        id: Date.now(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        role: formData.role || 'usuario',
        address: formData.address || '',
        registeredAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Nunca',
        status: formData.status || 'activo',
        paymentStatus: formData.paymentStatus || 'al_dia'
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    closeModal();
  };

  const handleDelete = (userId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'activo' ? 'inactivo' : 'activo' } as User
        : user
    ));
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'activo').length;
    const admins = users.filter(u => u.role === 'admin' || u.role === 'tesorero').length;
    const pendingPayments = users.filter(u => u.paymentStatus === 'pendiente' || u.paymentStatus === 'atrasado').length;
    
    return { totalUsers, activeUsers, admins, pendingPayments };
  };

  const stats = getStats();

  return (
    <div className="admin-management-container">
      <div className="management-header">
        <div className="header-info">
          <button className="back-button" onClick={() => navigate('/admin')}>
            ← Volver al Panel
          </button>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios registrados en el sistema</p>
        </div>
        <div className="header-actions">
          <button className="add-button" onClick={() => openModal()}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-icon">👥</div>
          <div className="summary-info">
            <div className="summary-number">{stats.totalUsers}</div>
            <div className="summary-label">Total Usuarios</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <div className="summary-number">{stats.activeUsers}</div>
            <div className="summary-label">Usuarios Activos</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🔧</div>
          <div className="summary-info">
            <div className="summary-number">{stats.admins}</div>
            <div className="summary-label">Administradores</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚠️</div>
          <div className="summary-info">
            <div className="summary-number">{stats.pendingPayments}</div>
            <div className="summary-label">Pagos Pendientes</div>
          </div>
        </div>
      </div>

      <div className="management-table-section">
        <div className="table-header">
          <h2>Lista de Usuarios</h2>
        </div>
        
        <div className="management-table">
          <div className="table-header-row">
            <div className="header-cell">Usuario</div>
            <div className="header-cell">Rol</div>
            <div className="header-cell">Contacto</div>
            <div className="header-cell">Estado</div>
            <div className="header-cell">Pagos</div>
            <div className="header-cell">Acciones</div>
          </div>

          {users.map(user => (
            <div key={user.id} className="table-data-row">
              <div className="data-cell">
                <div className="owner-info">
                  <div className="owner-name">{user.name}</div>
                  <div className="contact-info">{user.address}</div>
                  <div className="contact-info">
                    Registro: {new Date(user.registeredAt).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
              <div className="data-cell">
                <span className={`type-badge ${user.role}`}>
                  {user.role === 'usuario' ? 'Usuario' : 
                   user.role === 'admin' ? 'Administrador' : 'Tesorero'}
                </span>
              </div>
              <div className="data-cell">
                <div className="owner-info">
                  <div className="owner-name">{user.email}</div>
                  <div className="owner-phone">{user.phone}</div>
                  <div className="contact-info">
                    Último acceso: {user.lastLogin === 'Nunca' ? 'Nunca' : 
                      new Date(user.lastLogin).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>
              <div className="data-cell">
                <button 
                  className={`status-toggle ${user.status}`}
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.status}
                </button>
              </div>
              <div className="data-cell">
                <span className={`type-badge ${user.paymentStatus === 'al_dia' ? 'casa' : 
                  user.paymentStatus === 'pendiente' ? 'departamento' : 'negocio'}`}>
                  {user.paymentStatus === 'al_dia' ? 'Al Día' : 
                   user.paymentStatus === 'pendiente' ? 'Pendiente' : 'Atrasado'}
                </span>
              </div>
              <div className="data-cell actions">
                <button 
                  className="action-btn edit"
                  onClick={() => openModal(user)}
                >
                  Editar
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(user.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="modal-form">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="role"
                    value={formData.role || 'usuario'}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="tesorero">Tesorero</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="status"
                    value={formData.status || 'activo'}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado de Pagos</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus || 'al_dia'}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="al_dia">Al Día</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Dirección Completa</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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