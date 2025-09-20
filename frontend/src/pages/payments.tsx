import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import '../styles/payments.css';
import Header from '../components/header';
import Footer from '../components/footer';

function Payments(): React.JSX.Element {
  const [userEmail, setUserEmail] = useState('');
  const [payments] = useState([
    {
      id: 1,
      service: 'Electricidad',
      amount: 450.00,
      date: '2024-12-15',
      status: 'Pagado',
      receipt: 'CFE-001234'
    },
    {
      id: 2,
      service: 'Agua',
      amount: 280.50,
      date: '2024-12-10',
      status: 'Pagado',
      receipt: 'Agua'
    },
    {
      id: 3,
      service: 'Electricidad',
      amount: 420.75,
      date: '2024-11-15',
      status: 'Pagado',
      receipt: 'CFE-001122'
    },
    {
      id: 4,
      service: 'Agua',
      amount: 305.00,
      date: '2024-11-10',
      status: 'Pendiente',
      receipt: 'Agua'
    }
  ]);

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    setUserEmail(email || 'usuario@email.com');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  const getPendingPayments = () => {
    return payments.filter(payment => payment.status === 'Pendiente');
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="payments-container">
            
            {/* Header del dashboard */}
            <div className="dashboard-header">
              <div className="user-info">
                <h1>Mis Pagos</h1>
                <p>Bienvenido, {userEmail}</p>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
              </button>
            </div>

            {/* Estadísticas */}
            <div className="stats-grid">
              <div className="stat-card pending-payments">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>Pagos Pendientes</h3>
                  <p className="stat-value">{getPendingPayments().length}</p>
                </div>
              </div>
            </div>

            {/* Lista de pagos */}
            <div className="payments-section">
              <h2>Historial de Pagos</h2>
              <div className="payments-table">
                <div className="table-header">
                  <div className="header-cell">Servicio</div>
                  <div className="header-cell">Monto</div>
                  <div className="header-cell">Fecha</div>
                  <div className="header-cell">Estado</div>
                  <div className="header-cell">Recibo</div>
                  <div className="header-cell">Acciones</div>
                </div>
                
                {payments.map((payment) => (
                  <div key={payment.id} className="table-row">
                    <div className="table-cell">
                      <div className="service-info">
                        <span className="service-icon">
                          {payment.service === 'Electricidad' ? '⚡' : '💧'}
                        </span>
                        {payment.service}
                      </div>
                    </div>
                    <div className="table-cell amount">
                      ${payment.amount.toFixed(2)}
                    </div>
                    <div className="table-cell">
                      {new Date(payment.date).toLocaleDateString('es-MX')}
                    </div>
                    <div className="table-cell">
                      <span className={`status ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="table-cell receipt">
                      {payment.receipt}
                    </div>
                    <div className="table-cell actions">
                      <button className="action-btn view">Ver</button>
                      {payment.status === 'Pendiente' && (
                        <button 
                          className="action-btn pay"
                          onClick={() => {
                            window.location.href = `/procespayments?service=${payment.service}&amount=${payment.amount}&id=${payment.id}`;
                          }}
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Payments;
