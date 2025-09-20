import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/treasurer.css';
import Header from '../components/header';
import Footer from '../components/footer';

function Treasurer(): React.JSX.Element {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [receipts] = useState([
    {
      id: 1,
      user: 'Juan Pérez',
      email: 'juan@email.com',
      service: 'Electricidad',
      amount: 450.00,
      date: '2024-12-15',
      status: 'Pagado',
      receipt: 'CFE-001234',
      address: 'Calle Principal #123'
    },
    {
      id: 2,
      user: 'María González',
      email: 'maria@email.com',
      service: 'Agua',
      amount: 280.50,
      date: '2024-12-14',
      status: 'Pagado',
      receipt: 'AGUA-005678',
      address: 'Avenida Central #456'
    },
    {
      id: 3,
      user: 'Carlos Rodríguez',
      email: 'carlos@email.com',
      service: 'Electricidad',
      amount: 520.75,
      date: '2024-12-13',
      status: 'Pagado',
      receipt: 'CFE-009876',
      address: 'Calle Secundaria #789'
    },
    {
      id: 4,
      user: 'Ana Martínez',
      email: 'ana@email.com',
      service: 'Agua',
      amount: 305.00,
      date: '2024-12-12',
      status: 'Pendiente',
      receipt: 'AGUA-012345',
      address: 'Boulevard Norte #321'
    },
    {
      id: 5,
      user: 'Luis Hernández',
      email: 'luis@email.com',
      service: 'Electricidad',
      amount: 380.25,
      date: '2024-12-11',
      status: 'Pagado',
      receipt: 'CFE-456789',
      address: 'Callejón del Sol #654'
    }
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    // Verificar si el usuario está logueado y es tesorero o admin
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    if (!token || (role !== 'treasurer' && role !== 'admin')) {
      window.location.href = '/login';
      return;
    }
    
    setUserEmail(email || 'tesorero@quickpay.com');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const getFilteredReceipts = () => {
    if (filterStatus === 'Todos') {
      return receipts;
    }
    return receipts.filter(receipt => receipt.status === filterStatus);
  };

  const getTotalAmount = () => {
    return getFilteredReceipts()
      .filter(receipt => receipt.status === 'Pagado')
      .reduce((total, receipt) => total + receipt.amount, 0);
  };

  const getPendingCount = () => {
    return receipts.filter(receipt => receipt.status === 'Pendiente').length;
  };

  const viewReceiptDetails = (receipt: any) => {
    setSelectedReceipt(receipt);
  };

  const closeReceiptModal = () => {
    setSelectedReceipt(null);
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="treasurer-container">
            
            {/* Header del dashboard */}
            <div className="treasurer-header">
              <div className="user-info">
                <h1>Panel de Tesorero</h1>
                <p>Bienvenido, {userEmail}</p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={() => navigate('/admin')} 
                  className="admin-button"
                  style={{ display: localStorage.getItem('userRole') === 'admin' ? 'block' : 'none' }}
                >
                  Panel Admin
                </button>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Estadísticas de tesorería */}
            <div className="treasury-stats">
              <div className="stat-card total-collected">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Total Recaudado</h3>
                  <p className="stat-value">${getTotalAmount().toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card pending-receipts">
                <div className="stat-icon">📄</div>
                <div className="stat-info">
                  <h3>Recibos Pendientes</h3>
                  <p className="stat-value">{getPendingCount()}</p>
                </div>
              </div>
              <div className="stat-card total-receipts">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>Total Recibos</h3>
                  <p className="stat-value">{receipts.length}</p>
                </div>
              </div>
            </div>

            {/* Filtros y controles */}
            <div className="controls-section">
              <div className="filters">
                <label htmlFor="statusFilter">Filtrar por estado:</label>
                <select 
                  id="statusFilter"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="Todos">Todos</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div className="export-actions">
                <button className="export-btn">
                  📄 Exportar PDF
                </button>
                <button className="export-btn">
                  📊 Exportar Excel
                </button>
              </div>
            </div>

            {/* Lista de recibos */}
            <div className="receipts-section">
              <h2>Recibos de Usuarios ({getFilteredReceipts().length})</h2>
              <div className="receipts-table">
                <div className="table-header">
                  <div className="header-cell">Usuario</div>
                  <div className="header-cell">Servicio</div>
                  <div className="header-cell">Monto</div>
                  <div className="header-cell">Fecha</div>
                  <div className="header-cell">Estado</div>
                  <div className="header-cell">Acciones</div>
                </div>
                
                {getFilteredReceipts().map((receipt) => (
                  <div key={receipt.id} className="table-row">
                    <div className="table-cell">
                      <div className="user-info-cell">
                        <span className="user-name">{receipt.user}</span>
                        <span className="user-email">{receipt.email}</span>
                      </div>
                    </div>
                    <div className="table-cell">
                      <div className="service-info">
                        <span className="service-icon">
                          {receipt.service === 'Electricidad' ? '⚡' : '💧'}
                        </span>
                        {receipt.service}
                      </div>
                    </div>
                    <div className="table-cell amount">
                      ${receipt.amount.toFixed(2)}
                    </div>
                    <div className="table-cell">
                      {new Date(receipt.date).toLocaleDateString('es-MX')}
                    </div>
                    <div className="table-cell">
                      <span className={`status ${receipt.status.toLowerCase()}`}>
                        {receipt.status}
                      </span>
                    </div>
                    <div className="table-cell actions">
                      <button 
                        className="action-btn view"
                        onClick={() => viewReceiptDetails(receipt)}
                      >
                        Ver Detalle
                      </button>
                      <button className="action-btn download">
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal de detalle de recibo */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={closeReceiptModal}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Recibo</h3>
              <button className="close-btn" onClick={closeReceiptModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="receipt-detail">
                <div className="detail-row">
                  <label>Usuario:</label>
                  <span>{selectedReceipt.user}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedReceipt.email}</span>
                </div>
                <div className="detail-row">
                  <label>Dirección:</label>
                  <span>{selectedReceipt.address}</span>
                </div>
                <div className="detail-row">
                  <label>Servicio:</label>
                  <span>{selectedReceipt.service}</span>
                </div>
                <div className="detail-row">
                  <label>Monto:</label>
                  <span className="amount">${selectedReceipt.amount.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <label>Fecha de Pago:</label>
                  <span>{new Date(selectedReceipt.date).toLocaleDateString('es-MX')}</span>
                </div>
                <div className="detail-row">
                  <label>Número de Recibo:</label>
                  <span>{selectedReceipt.receipt}</span>
                </div>
                <div className="detail-row">
                  <label>Estado:</label>
                  <span className={`status ${selectedReceipt.status.toLowerCase()}`}>
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="action-btn primary">
                  📄 Imprimir Recibo
                </button>
                <button className="action-btn secondary">
                  📧 Enviar por Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default Treasurer;