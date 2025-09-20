import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/admin-management.css';
import Header from '../components/header';
import Footer from '../components/footer';

interface Vivienda {
  id: number;
  direccion: string;
  tipo: string;
  propietario: string;
  medidorLuz: string;
  medidorAgua: string;
  email: string;
  telefono: string;
  fechaRegistro: string;
  estado: string;
}

function AdminViviendas(): React.JSX.Element {
  const navigate = useNavigate();
  const [viviendas, setViviendas] = useState<Vivienda[]>([
    {
      id: 1,
      direccion: 'Calle Principal #123',
      tipo: 'Casa',
      propietario: 'Juan Pérez',
      medidorLuz: 'CFE-12345',
      medidorAgua: 'AGUA-67890',
      email: 'juan@email.com',
      telefono: '555-1234',
      fechaRegistro: '2024-01-15',
      estado: 'Activa'
    },
    {
      id: 2,
      direccion: 'Avenida Central #456',
      tipo: 'Departamento',
      propietario: 'María González',
      medidorLuz: 'CFE-54321',
      medidorAgua: 'AGUA-09876',
      email: 'maria@email.com',
      telefono: '555-5678',
      fechaRegistro: '2024-02-20',
      estado: 'Activa'
    },
    {
      id: 3,
      direccion: 'Calle Secundaria #789',
      tipo: 'Negocio',
      propietario: 'Carlos Rodríguez',
      medidorLuz: 'CFE-98765',
      medidorAgua: 'Sin medidor',
      email: 'carlos@email.com',
      telefono: '555-9012',
      fechaRegistro: '2024-03-10',
      estado: 'Activa'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingVivienda, setEditingVivienda] = useState<Vivienda | null>(null);
  const [formData, setFormData] = useState({
    direccion: '',
    tipo: 'Casa',
    propietario: '',
    medidorLuz: '',
    medidorAgua: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    // Verificar si el usuario está logueado y es administrador
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
      window.location.href = '/login';
      return;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const openAddModal = () => {
    setEditingVivienda(null);
    setFormData({
      direccion: '',
      tipo: 'Casa',
      propietario: '',
      medidorLuz: '',
      medidorAgua: '',
      email: '',
      telefono: ''
    });
    setShowModal(true);
  };

  const openEditModal = (vivienda: Vivienda) => {
    setEditingVivienda(vivienda);
    setFormData({
      direccion: vivienda.direccion,
      tipo: vivienda.tipo,
      propietario: vivienda.propietario,
      medidorLuz: vivienda.medidorLuz,
      medidorAgua: vivienda.medidorAgua,
      email: vivienda.email,
      telefono: vivienda.telefono
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVivienda(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVivienda) {
      // Editar vivienda existente
      setViviendas(prev => prev.map(v => 
        v.id === editingVivienda.id 
          ? { ...v, ...formData }
          : v
      ));
    } else {
      // Agregar nueva vivienda
      const newVivienda: Vivienda = {
        id: Math.max(...viviendas.map(v => v.id)) + 1,
        ...formData,
        fechaRegistro: new Date().toISOString().split('T')[0],
        estado: 'Activa'
      };
      setViviendas(prev => [...prev, newVivienda]);
    }
    
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta vivienda?')) {
      setViviendas(prev => prev.filter(v => v.id !== id));
    }
  };

  const toggleEstado = (id: number) => {
    setViviendas(prev => prev.map(v => 
      v.id === id 
        ? { ...v, estado: v.estado === 'Activa' ? 'Inactiva' : 'Activa' }
        : v
    ));
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="admin-management-container">
            
            {/* Header */}
            <div className="management-header">
              <div className="header-info">
                <button 
                  onClick={() => navigate('/admin')} 
                  className="back-button"
                >
                  ← Volver al Panel
                </button>
                <h1>Gestión de Viviendas</h1>
                <p>Administra las viviendas registradas en el sistema</p>
              </div>
              <div className="header-actions">
                <button onClick={openAddModal} className="add-button">
                  + Agregar Vivienda
                </button>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="stats-summary">
              <div className="summary-card">
                <div className="summary-icon">🏠</div>
                <div className="summary-info">
                  <span className="summary-number">{viviendas.length}</span>
                  <span className="summary-label">Total Viviendas</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div className="summary-info">
                  <span className="summary-number">{viviendas.filter(v => v.estado === 'Activa').length}</span>
                  <span className="summary-label">Activas</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">❌</div>
                <div className="summary-info">
                  <span className="summary-number">{viviendas.filter(v => v.estado === 'Inactiva').length}</span>
                  <span className="summary-label">Inactivas</span>
                </div>
              </div>
            </div>

            {/* Tabla de viviendas */}
            <div className="management-table-section">
              <div className="table-header">
                <h2>Lista de Viviendas ({viviendas.length})</h2>
              </div>
              
              <div className="management-table">
                <div className="table-header-row">
                  <div className="header-cell">Dirección</div>
                  <div className="header-cell">Tipo</div>
                  <div className="header-cell">Propietario</div>
                  <div className="header-cell">Medidor Luz</div>
                  <div className="header-cell">Estado</div>
                  <div className="header-cell">Acciones</div>
                </div>
                
                {viviendas.map((vivienda) => (
                  <div key={vivienda.id} className="table-data-row">
                    <div className="data-cell">
                      <div className="address-info">
                        <span className="address">{vivienda.direccion}</span>
                        <span className="contact-info">{vivienda.email}</span>
                      </div>
                    </div>
                    <div className="data-cell">
                      <span className={`type-badge ${vivienda.tipo.toLowerCase()}`}>
                        {vivienda.tipo}
                      </span>
                    </div>
                    <div className="data-cell">
                      <div className="owner-info">
                        <span className="owner-name">{vivienda.propietario}</span>
                        <span className="owner-phone">{vivienda.telefono}</span>
                      </div>
                    </div>
                    <div className="data-cell">
                      <span className="meter-code">{vivienda.medidorLuz}</span>
                    </div>
                    <div className="data-cell">
                      <button 
                        className={`status-toggle ${vivienda.estado.toLowerCase()}`}
                        onClick={() => toggleEstado(vivienda.id)}
                      >
                        {vivienda.estado}
                      </button>
                    </div>
                    <div className="data-cell actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => openEditModal(vivienda)}
                      >
                        Editar
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(vivienda.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal para agregar/editar vivienda */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVivienda ? 'Editar Vivienda' : 'Agregar Nueva Vivienda'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Dirección*</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Calle, número, colonia"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de Vivienda*</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Casa">Casa</option>
                    <option value="Departamento">Departamento</option>
                    <option value="Negocio">Negocio</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Propietario*</label>
                  <input
                    type="text"
                    name="propietario"
                    value={formData.propietario}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono*</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="555-1234"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Medidor de Luz*</label>
                  <input
                    type="text"
                    name="medidorLuz"
                    value={formData.medidorLuz}
                    onChange={handleInputChange}
                    placeholder="CFE-12345"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Medidor de Agua</label>
                  <input
                    type="text"
                    name="medidorAgua"
                    value={formData.medidorAgua}
                    onChange={handleInputChange}
                    placeholder="AGUA-67890 o 'Sin medidor'"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingVivienda ? 'Actualizar' : 'Agregar'} Vivienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default AdminViviendas;