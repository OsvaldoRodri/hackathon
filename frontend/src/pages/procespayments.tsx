import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './procespayments.css';

const ProcesPayments: React.FC = () => {
  const navigate = useNavigate();
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
    const amountParam = urlParams.get('amount');
    const conceptParam = urlParams.get('concept');
    
    if (amountParam) setAmount(amountParam);
    if (conceptParam) setPaymentConcept(conceptParam);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!amount || !paymentConcept) {
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
    <div className="proces-payments-container">
      <div className="payment-card">
        <h2>🏦 Procesar Pago</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="amount">Monto a Pagar:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="concept">Concepto del Pago:</label>
            <input
              type="text"
              id="concept"
              value={paymentConcept}
              onChange={(e) => setPaymentConcept(e.target.value)}
              placeholder="Ej: Pago de luz - Enero 2024"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="process-btn"
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Procesando...' : '💳 Procesar Pago'}
            </button>
          </div>
        </form>

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Procesando tu pago de forma segura...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcesPayments;