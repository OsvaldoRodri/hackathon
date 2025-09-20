import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './procespayments.css';

const ProcesPayments: React.FC = () => {
  const navigate = useNavigate();
  const [walletCode, setWalletCode] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentConcept, setPaymentConcept] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

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
      setPaymentConcept(serviceFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!walletCode || !amount || !paymentConcept) {
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
        <div className="payment-form-container">
          <div className="form-header">
            <h1>Procesar Pago</h1>
            <p>Complete la información para procesar su pago</p>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="walletCode">Código de Billetera</label>
              <input
                type="text"
                id="walletCode"
                value={walletCode}
                onChange={(e) => setWalletCode(e.target.value)}
                placeholder="Ingrese el código de su billetera"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Monto a Pagar</label>
              <div className="amount-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="paymentConcept">Concepto de Pago</label>
              <textarea
                id="paymentConcept"
                value={paymentConcept}
                onChange={(e) => setPaymentConcept(e.target.value)}
                placeholder="Describa el concepto del pago"
                rows={3}
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando...' : 'Procesar Pago'}
              </button>
            </div>
          </form>

          <div className="payment-info">
            <div className="info-card">
              <h3>Información del Pago</h3>
              <div className="info-item">
                <span className="label">Monto:</span>
                <span className="value">${amount || '0.00'}</span>
              </div>
              <div className="info-item">
                <span className="label">Concepto:</span>
                <span className="value">{paymentConcept || 'Sin especificar'}</span>
              </div>
              <div className="info-item">
                <span className="label">Estado:</span>
                <span className="value status-pending">Pendiente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 QuickPay. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProcesPayments;