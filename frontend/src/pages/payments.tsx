import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/payments.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { apiService, Recibo, Usuario, Domicilio, Wallet } from '../services/api';

function Payments(): React.JSX.Element {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [userDomicilios, setUserDomicilios] = useState<Domicilio[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [userWallet, setUserWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('userToken');
    const email = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    setUserEmail(email || 'usuario@email.com');
    
    if (userId) {
      loadUserData(parseInt(userId));
    }
  }, []);

  const loadUserData = async (userId: number) => {
    try {
      setIsLoading(true);
      
      // Cargar datos del usuario
      const userResponse = await apiService.getUsuario(userId);
      if (userResponse.success) {
        setCurrentUser(userResponse.data);
        setUserDomicilios(userResponse.data.propiedades || []);
        
        // Cargar wallet del usuario
        await loadUserWallet(userId);
        
        // Cargar recibos de todas las propiedades del usuario
        await loadUserRecibos(userResponse.data.propiedades || []);
      } else {
        setError('Error al cargar datos del usuario');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Error al cargar datos del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserWallet = async (userId: number) => {
    try {
      const walletResponse = await apiService.getUserWallet(userId);
      if (walletResponse.success) {
        setUserWallet(walletResponse.data);
      } else {
        // Usuario no tiene wallet, es normal
        setUserWallet(null);
      }
    } catch (error) {
      console.error('Error loading user wallet:', error);
      setUserWallet(null);
    }
  };

  const loadUserRecibos = async (domicilios: Domicilio[]) => {
    try {
      const allRecibos: Recibo[] = [];
      
      for (const domicilio of domicilios) {
        const recibosResponse = await apiService.getDomicilioRecibos(domicilio.id);
        if (recibosResponse.success) {
          allRecibos.push(...recibosResponse.data);
        }
      }
      
      // Ordenar recibos por fecha de vencimiento (más recientes primero)
      allRecibos.sort((a, b) => new Date(b.fechaVencimiento).getTime() - new Date(a.fechaVencimiento).getTime());
      setRecibos(allRecibos);
    } catch (error) {
      console.error('Error loading recibos:', error);
      setError('Error al cargar recibos');
    }
  };

  const handleCreateWallet = async (walletUrl: string) => {
    try {
      if (!currentUser) {
        setError('Usuario no identificado');
        return;
      }

      // Validar wallet URL primero
      const validationResponse = await apiService.validateWalletUrl(walletUrl);
      if (!validationResponse.success || !validationResponse.data.isValid) {
        setError('La URL de wallet proporcionada no es válida');
        return;
      }

      // Crear wallet
      const createResponse = await apiService.createWallet({
        userId: currentUser.id,
        walletUrl: walletUrl,
        publicKey: 'auto-generated' // En un caso real, esto se generaría apropiadamente
      });

      if (createResponse.success) {
        setUserWallet(createResponse.data);
        setError('');
        alert('¡Wallet configurada exitosamente!');
      } else {
        setError(createResponse.error || 'Error al crear la wallet');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Error al configurar la wallet');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.href = '/';
  };

  const handlePayRecibo = async (reciboId: number) => {
    try {
      if (!currentUser) {
        setError('Usuario no identificado');
        return;
      }

      if (!userWallet) {
        setError('No tienes una wallet configurada. Necesitas configurar tu wallet para realizar pagos.');
        return;
      }

      const response = await apiService.pagarRecibo(reciboId, {
        userId: currentUser.id,
        walletCode: userWallet.walletUrl
      });

      if (response.success) {
        // Recargar recibos después del pago
        if (currentUser) {
          await loadUserRecibos(userDomicilios);
          // Recargar wallet para actualizar balance
          await loadUserWallet(currentUser.id);
        }
        setError(''); // Limpiar errores
        alert('¡Pago procesado exitosamente con OpenPayments!');
      } else {
        setError(response.error || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error paying recibo:', error);
      setError('Error al procesar el pago');
    }
  };

  const getPendingPayments = () => {
    return recibos.filter(recibo => recibo.estado === 'pendiente');
  };

  const getOverduePayments = () => {
    return recibos.filter(recibo => {
      const today = new Date();
      const vencimiento = new Date(recibo.fechaVencimiento);
      return recibo.estado === 'pendiente' && vencimiento < today;
    });
  };

  const getTotalPendingAmount = () => {
    return getPendingPayments().reduce((sum, recibo) => sum + parseFloat(recibo.monto.toString()), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'status-paid';
      case 'pendiente': return 'status-pending';
      case 'vencido': return 'status-overdue';
      default: return '';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente';
      case 'vencido': return 'Vencido';
      default: return estado;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main>
          <div className="main-content">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <h2>Cargando información de pagos...</h2>
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
          <div className="payments-container">
            
            {/* Header del dashboard */}
            <div className="dashboard-header">
              <div className="user-info">
                <h1>Mis Pagos</h1>
                <p>Bienvenido, {currentUser ? `${currentUser.nombre} ${currentUser.apellido}` : userEmail}</p>
                {userDomicilios.length > 0 && (
                  <p className="properties-info">
                    {userDomicilios.length} propiedad{userDomicilios.length > 1 ? 'es' : ''} registrada{userDomicilios.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button onClick={handleLogout} className="logout-button">
                Cerrar Sesión
              </button>
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
              <div className="stat-card pending-payments">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>Pagos Pendientes</h3>
                  <p className="stat-value">{getPendingPayments().length}</p>
                </div>
              </div>
              
              <div className="stat-card overdue-payments">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <h3>Pagos Vencidos</h3>
                  <p className="stat-value">{getOverduePayments().length}</p>
                </div>
              </div>
              
              <div className="stat-card total-amount">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>Monto Pendiente</h3>
                  <p className="stat-value">{formatCurrency(getTotalPendingAmount())}</p>
                </div>
              </div>

              <div className="stat-card properties">
                <div className="stat-icon">🏠</div>
                <div className="stat-info">
                  <h3>Propiedades</h3>
                  <p className="stat-value">{userDomicilios.length}</p>
                </div>
              </div>
            </div>

            {/* Información de wallet */}
            <div className="wallet-section">
              <h2>Mi Wallet OpenPayments</h2>
              {userWallet ? (
                <div className="wallet-card">
                  <div className="wallet-info">
                    <h3>Wallet Configurada</h3>
                    <p><strong>URL:</strong> {userWallet.walletUrl}</p>
                    <p><strong>Balance estimado:</strong> ${parseFloat(userWallet.balance.toString()).toFixed(2)}</p>
                    <p><strong>Estado:</strong> <span className={`status-badge ${userWallet.isActive ? 'status-paid' : 'status-pending'}`}>
                      {userWallet.isActive ? 'Activa' : 'Inactiva'}
                    </span></p>
                  </div>
                </div>
              ) : (
                <div className="no-wallet">
                  <p>No tienes una wallet configurada. Para realizar pagos con OpenPayments necesitas configurar tu wallet.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      const walletUrl = prompt('Ingresa la URL de tu wallet OpenPayments:');
                      if (walletUrl && currentUser) {
                        handleCreateWallet(walletUrl);
                      }
                    }}
                  >
                    Configurar Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Propiedades del usuario */}
            {userDomicilios.length > 0 && (
              <div className="properties-section">
                <h2>Mis Propiedades</h2>
                <div className="properties-grid">
                  {userDomicilios.map(domicilio => (
                    <div key={domicilio.id} className="property-card">
                      <h3>{domicilio.tipo.charAt(0).toUpperCase() + domicilio.tipo.slice(1)} {domicilio.numero}</h3>
                      <p>Calle: {domicilio.calle}</p>
                      <p>Colonia: {domicilio.colonia}</p>
                      <p>Municipio: {domicilio.municipio}, {domicilio.estado}</p>
                      <p>Recibos: {recibos.filter(r => r.domicilioId === domicilio.id).length}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de pagos */}
            <div className="payments-section">
              <h2>Historial de Recibos</h2>
              
              {recibos.length === 0 ? (
                <div className="no-payments">
                  <p>No tienes recibos registrados.</p>
                </div>
              ) : (
                <div className="payments-table-container">
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Concepto</th>
                        <th>Propiedad</th>
                        <th>Monto</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Fecha Pago</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recibos.map(recibo => {
                        const domicilio = userDomicilios.find(d => d.id === recibo.domicilioId);
                        return (
                          <tr key={recibo.id}>
                            <td>{recibo.numero}</td>
                            <td>{recibo.concepto}</td>
                            <td>
                              {domicilio ? `${domicilio.tipo} ${domicilio.numero} - ${domicilio.calle}, ${domicilio.colonia}` : 'N/A'}
                            </td>
                            <td>{formatCurrency(parseFloat(recibo.monto.toString()))}</td>
                            <td>{formatDate(recibo.fechaVencimiento)}</td>
                            <td>
                              <span className={`status-badge ${getEstadoClass(recibo.estado)}`}>
                                {getEstadoText(recibo.estado)}
                              </span>
                            </td>
                            <td>{recibo.fechaPago ? formatDate(recibo.fechaPago) : '-'}</td>
                            <td>
                              {recibo.estado === 'pendiente' && (
                                <button 
                                  className="btn-pay"
                                  onClick={() => handlePayRecibo(recibo.id)}
                                >
                                  Pagar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Botón para proceso de pagos */}
            {getPendingPayments().length > 0 && (
              <div className="payment-actions">
                <button 
                  className="btn-primary-large"
                  onClick={() => window.location.href = '/procespayments'}
                >
                  Procesar Pagos Pendientes ({getPendingPayments().length})
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Payments;