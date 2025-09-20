import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/admin-management.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { apiService, Domicilio, Usuario } from '../services/api';

function AdminViviendas(): React.JSX.Element {
  const navigate = useNavigate();
  const [domicilios, setDomicilios] = useState<Domicilio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDomicilio, setEditingDomicilio] = useState<Domicilio | null>(null);
  const [formData, setFormData] = useState({
    calle: '',
    numero: '',
    colonia: '',
    municipio: '',
    estado: '',
    tipo: 'apartamento' as 'apartamento' | 'casa' | 'local',
    duenoId: 0
  });

  useEffect(() => {
    // Verificar si el usuario está logueado y es administrador/tesorero
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || (role !== 'admin' && role !== 'tesorero')) {
      window.location.href = '/login';
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar domicilios y usuarios en paralelo
      const [domiciliosResponse, usuariosResponse] = await Promise.all([
        apiService.getDomicilios(),
        apiService.getDuenos() // Solo obtener dueños para asignar propiedades
      ]);

      if (domiciliosResponse.success) {
        setDomicilios(domiciliosResponse.data);
      } else {
        setError('Error al cargar domicilios');
      }

      if (usuariosResponse.success) {
        setUsuarios(usuariosResponse.data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (domicilio?: Domicilio) => {
    if (domicilio) {
      setEditingDomicilio(domicilio);
      setFormData({
        calle: domicilio.calle,
        numero: domicilio.numero,
        colonia: domicilio.colonia,
        municipio: domicilio.municipio,
        estado: domicilio.estado,
        tipo: domicilio.tipo,
        duenoId: domicilio.duenoId
      });
    } else {
      setEditingDomicilio(null);
      setFormData({
        calle: '',
        numero: '',
        colonia: '',
        municipio: '',
        estado: '',
        tipo: 'apartamento',
        duenoId: 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDomicilio(null);
    setFormData({
      calle: '',
      numero: '',
      colonia: '',
      municipio: '',
      estado: '',
      tipo: 'apartamento',
      duenoId: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDomicilio) {
        // Actualizar domicilio existente
        // Note: El backend no tiene endpoint de actualización de domicilios aún
        setError('Función de actualización no implementada en el backend');
      } else {
        // Crear nuevo domicilio
        const response = await apiService.createDomicilio(formData);
        if (response.success) {
          await loadData(); // Recargar la lista
          closeModal();
        } else {
          setError('Error al crear domicilio');
        }
      }
    } catch (error) {
      console.error('Error saving domicilio:', error);
      setError('Error al guardar domicilio');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duenoId' ? parseFloat(value) || 0 : value
    }));
  };

  const getTipoDisplayName = (tipo: string) => {
    switch (tipo) {
      case 'apartamento': return 'Apartamento';
      case 'casa': return 'Casa';
      case 'local': return 'Local/Negocio';
      default: return tipo;
    }
  };

  const getPropietarioName = (duenoId: number) => {
    const propietario = usuarios.find(u => u.id === duenoId);
    return propietario ? `${propietario.nombre} ${propietario.apellido}` : 'No asignado';
  };

  const getPropietarioEmail = (duenoId: number) => {
    const propietario = usuarios.find(u => u.id === duenoId);
    return propietario ? propietario.email : '';
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main>
          <div className="main-content">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>Cargando viviendas...</h2>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="admin-container">
            <div className="admin-header">
              <h1>Gestión de Viviendas</h1>
              <div className="admin-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => openModal()}
                >
                  + Nueva Vivienda
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
                <h3>Total Viviendas</h3>
                <p className="stat-value">{domicilios.length}</p>
              </div>
              <div className="stat-card">
                <h3>Apartamentos</h3>
                <p className="stat-value">{domicilios.filter(d => d.tipo === 'apartamento').length}</p>
              </div>
              <div className="stat-card">
                <h3>Casas</h3>
                <p className="stat-value">{domicilios.filter(d => d.tipo === 'casa').length}</p>
              </div>
              <div className="stat-card">
                <h3>Locales</h3>
                <p className="stat-value">{domicilios.filter(d => d.tipo === 'local').length}</p>
              </div>
            </div>

            {/* Tabla de viviendas */}
            <div className="viviendas-section">
              <div className="table-container">
                <table className="viviendas-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Número</th>
                      <th>Calle</th>
                      <th>Colonia</th>
                      <th>Municipio</th>
                      <th>Estado</th>
                      <th>Tipo</th>
                      <th>Propietario</th>
                      <th>Email</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domicilios.map(domicilio => (
                      <tr key={domicilio.id}>
                        <td>{domicilio.id}</td>
                        <td>{domicilio.numero}</td>
                        <td>{domicilio.calle}</td>
                        <td>{domicilio.colonia}</td>
                        <td>{domicilio.municipio}</td>
                        <td>{domicilio.estado}</td>
                        <td>
                          <span className={`type-badge type-${domicilio.tipo}`}>
                            {getTipoDisplayName(domicilio.tipo)}
                          </span>
                        </td>
                        <td>{getPropietarioName(domicilio.duenoId)}</td>
                        <td>{getPropietarioEmail(domicilio.duenoId)}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn-edit"
                            onClick={() => openModal(domicilio)}
                            title="Editar vivienda"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-view"
                            onClick={() => {
                              // Implementar vista de recibos de la vivienda
                              navigate(`/admin/viviendas/${domicilio.id}/recibos`);
                            }}
                            title="Ver recibos"
                          >
                            📄
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal para crear/editar vivienda */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>{editingDomicilio ? 'Editar Vivienda' : 'Nueva Vivienda'}</h2>
                    <button className="modal-close" onClick={closeModal}>×</button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="vivienda-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="numero">Número*</label>
                        <input
                          type="text"
                          id="numero"
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="calle">Calle*</label>
                        <input
                          type="text"
                          id="calle"
                          name="calle"
                          value={formData.calle}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="colonia">Colonia*</label>
                        <input
                          type="text"
                          id="colonia"
                          name="colonia"
                          value={formData.colonia}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="municipio">Municipio*</label>
                        <input
                          type="text"
                          id="municipio"
                          name="municipio"
                          value={formData.municipio}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="estado">Estado*</label>
                        <input
                          type="text"
                          id="estado"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="tipo">Tipo de Vivienda*</label>
                        <select
                          id="tipo"
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="apartamento">Apartamento</option>
                          <option value="casa">Casa</option>
                          <option value="local">Local/Negocio</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="duenoId">Propietario*</label>
                      <select
                        id="duenoId"
                        name="duenoId"
                        value={formData.duenoId || ''}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un propietario</option>
                        {usuarios.map(usuario => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombre} {usuario.apellido} ({usuario.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="modal-actions">
                      <button type="button" className="btn-secondary" onClick={closeModal}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingDomicilio ? 'Actualizar' : 'Crear'} Vivienda
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AdminViviendas;