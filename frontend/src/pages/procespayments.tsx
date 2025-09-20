import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './procespayments.css';
import '../styles/admin-management.css'; // Para usar los estilos del modal

const ProcesPayments: React.FC = () => {
  const navigate = useNavigate();
  const [walletName, setWalletName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [service, setService] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const amountFromUrl = urlParams.get('amount');
    const serviceFromUrl = urlParams.get('service');
    
    if (amountFromUrl) {
      setAmount(amountFromUrl.replace('$', ''));
    }
    if (serviceFromUrl) {
      setService(serviceFromUrl);
    }
    
    // Mostrar el modal al cargar la página
    setShowPaymentModal(true);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!walletName || !description) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulación de llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular procesamiento exitoso
      alert('¡Pago procesado exitosamente!');
      navigate('/payments');
    } catch (err) {
      setError('Error al procesar el pago. Intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setShowPaymentModal(false);
    navigate('/payments');
  };

  return (
    <div className="procespayments-container">
      <div className="navbar">
        <div className="navbar-brand">
          <img src="/logo.png" alt="QuickPay" className="navbar-logo" />
          <span>QuickPay</span>
        </div>
        <div className="navbar-actions">
          <button 
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem('userToken');
              localStorage.removeItem('userEmail');
              navigate('/');
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="payment-info-display">
          <h2>Procesando Pago</h2>
          <div className="payment-details">
            <div className="detail-item">
              <span className="label">Servicio:</span>
              <span className="value">{service}</span>
            </div>
            <div className="detail-item">
              <span className="label">Monto:</span>
              <span className="value">${amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuración de wallet */}
      {showPaymentModal && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal">
            <div className="wallet-modal-header">
              <div className="modal-icon">
                <span>💰</span>
              </div>
              <h2>Configurar Pago</h2>
              <p>Conecta tu wallet para procesar el pago</p>
              <button 
                className="modal-close-button"
                onClick={handleCancel}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            
            <div className="wallet-modal-body">
              <form onSubmit={handleSubmit} className="wallet-form">
                {error && <div className="error-message">{error}</div>}
                
                <div className="input-group">
                  <div className="input-icon">🔗</div>
                  <div className="input-content">
                    <label>Conectar Wallet de Interledger</label>
                    <a 
                      href="https://interledger.org/setup-wallet" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="wallet-connect-link"
                    >
                      🚀 Configurar tu Wallet Interledger
                    </a>
                    <span className="input-help">
                      Haz clic para configurar o conectar tu wallet Interledger
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-icon">🏷️</div>
                  <div className="input-content">
                    <label htmlFor="walletName">Nombre de la Wallet</label>
                    <input
                      type="text"
                      id="walletName"
                      name="walletName"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="Mi Wallet Principal"
                      required
                      maxLength={50}
                    />
                    <span className="input-help">
                      Nombre identificativo para tu wallet
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <div className="input-icon">📝</div>
                  <div className="input-content">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe el propósito de esta transacción..."
                      required
                      rows={3}
                      maxLength={200}
                    />
                    <span className="input-help">
                      Detalles adicionales • {200 - description.length} caracteres restantes
                    </span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCancel} className="btn-secondary">
                    <span>↩️</span>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={isProcessing}>
                    <span>💳</span>
                    {isProcessing ? 'Procesando...' : 'Procesar Pago'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 QuickPay. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProcesPayments;