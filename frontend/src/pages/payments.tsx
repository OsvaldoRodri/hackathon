import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import '../styles/payments.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { apiService, Recibo, Usuario, Domicilio } from '../services/api';

function Payments(): React.JSX.Element {
  const [userEmail, setUserEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [userDomicilios, setUserDomicilios] = useState<Domicilio[]>([]);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
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
        
        // Cargar recibos de todas las propiedades del usuario
        await loadUserRecibos(userResponse.data.propiedades || []);
      } else {
        setError('Error al cargar datos del usuario');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRecibos = async (domicilios: Domicilio[]) => {
    try {
      let allRecibos: Recibo[] = [];
      
      for (const domicilio of domicilios) {
        const response = await apiService.getDomicilioRecibos(domicilio.id);
        if (response.success) {
          allRecibos = [...allRecibos, ...response.data];
        }
      }
      
      setRecibos(allRecibos);
    } catch (error) {
      console.error('Error loading recibos:', error);
      setError('Error al cargar recibos');
    }
  };

  const handlePayment = async (reciboId: number) => {
    if (!currentUser) {
      alert('Error: Usuario no identificado');
      return;
    }

    const confirmation = window.confirm('¿Está seguro que desea procesar este pago?');
    if (!confirmation) return;

    try {
      const paymentData = {
        userId: currentUser.id
      };

      const response = await apiService.pagarRecibo(reciboId, paymentData);
      
      if (response.success) {
        alert('Pago procesado exitosamente');
        // Recargar recibos para actualizar el estado
        await loadUserRecibos(userDomicilios);
      } else {
        alert(`Error al procesar el pago: ${response.error}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago');
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="payments-container">
        <Header />
        <div className="main-content">
          <div className="loading">Cargando...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payments-container">
      <Header />
      
      <div className="main-content">
        <div className="welcome-section">
          <h1>Bienvenido, {currentUser?.nombre || 'Usuario'}</h1>
          <p>Gestiona tus pagos de servicios de agua y luz</p>
          <div className="user-info">
            <span>📧 {userEmail}</span>
            <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="content-wrapper">
          <div className="recibos-section">
            <h2>Mis Recibos</h2>
            {recibos.length === 0 ? (
              <div className="no-recibos">
                <p>No tienes recibos disponibles</p>
              </div>
            ) : (
              <div className="recibos-grid">
                {recibos.map((recibo) => (
                  <div key={recibo.id} className="recibo-card">
                    <div className="recibo-header">
                      <h3>Recibo #{recibo.numero}</h3>
                      <span className={`status-badge status-${recibo.estado}`}>
                        {recibo.estado.charAt(0).toUpperCase() + recibo.estado.slice(1)}
                      </span>
                    </div>
                    
                    <div className="recibo-details">
                      <p><strong>Concepto:</strong> {recibo.concepto}</p>
                      <p><strong>Monto:</strong> ${parseFloat(recibo.monto.toString()).toFixed(2)}</p>
                      <p><strong>Vencimiento:</strong> {new Date(recibo.fechaVencimiento).toLocaleDateString()}</p>
                      {recibo.fechaPago && (
                        <p><strong>Fecha de Pago:</strong> {new Date(recibo.fechaPago).toLocaleDateString()}</p>
                      )}
                    </div>

                    {recibo.estado === 'pendiente' && (
                      <div className="payment-actions">
                        <button 
                          onClick={() => handlePayment(recibo.id)}
                          className="pay-btn"
                        >
                          Pagar Recibo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Payments;