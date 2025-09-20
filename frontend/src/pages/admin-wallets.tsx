import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/admin-management.css';
import Header from '../components/header';
import Footer from '../components/footer';

function AdminWallets(): React.JSX.Element {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [wallets, setWallets] = useState([
    {
      id: 1,
      walletKey: '1A2B3C4D5E6F7G8H9I0J',
      amount: 5000.00,
      concept: 'Mantenimiento General Septiembre 2025',
      dateCreated: '2025-09-15',
      status: 'Activa'
    },
    {
      id: 2,
      walletKey: 'K1L2M3N4O5P6Q7R8S9T0',
      amount: 1500.50,
      concept: 'Reparación de Jardines',
      dateCreated: '2025-09-10',
      status: 'Activa'
    }
  ]);

  // Estados para el formulario
  const [newWallet, setNewWallet] = useState({
    walletKey: '',
    amount: '',
    concept: ''
  });

  useEffect(() => {
    // Verificar si el usuario está logueado y es administrador
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    if (!token || role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    
    setUserEmail(email || 'admin@quickpay.com');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWallet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar al backend
    console.log('Nueva wallet:', newWallet);
    
    // Simular agregar a la lista (solo para diseño)
    const newWalletItem = {
      id: wallets.length + 1,
      walletKey: newWallet.walletKey,
      amount: parseFloat(newWallet.amount),
      concept: newWallet.concept,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'Activa'
    };
    
    setWallets([...wallets, newWalletItem]);
    setNewWallet({ walletKey: '', amount: '', concept: '' });
    setShowAddWalletForm(false);
  };

  const handleCancel = () => {
    setNewWallet({ walletKey: '', amount: '', concept: '' });
    setShowAddWalletForm(false);
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="admin-container">
            
            {/* Header del dashboard */}
            <div className="admin-header">
              <div className="user-info">
                <h1>Gestión de Wallets</h1>
                <p>Administrar wallets de pago - {userEmail}</p>
              </div>
              <div className="header-actions">
                <button 
                  onClick={() => navigate('/admin')} 
                  className="back-button"
                >
                  ← Volver al Panel
                </button>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Botón para agregar nueva wallet */}
            <div className="actions-bar">
              <button 
                className="add-button"
                onClick={() => setShowAddWalletForm(true)}
                disabled={showAddWalletForm}
              >
                + Agregar Nueva Wallet
              </button>
            </div>

            {/* Formulario para agregar wallet */}
            {showAddWalletForm && (
              <div className="form-overlay">
                <div className="form-container">
                  <div className="form-header">
                    <h2>Agregar Nueva Wallet</h2>
                    <button 
                      className="close-button"
                      onClick={handleCancel}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="wallet-form">
                    <div className="form-group">
                      <label htmlFor="walletKey">Key de la Wallet*</label>
                      <input
                        type="text"
                        id="walletKey"
                        name="walletKey"
                        value={newWallet.walletKey}
                        onChange={handleInputChange}
                        placeholder="Ej: 1A2B3C4D5E6F7G8H9I0J"
                        required
                        maxLength={50}
                      />
                      <small className="form-hint">
                        Ingresa la clave única de la wallet (máximo 50 caracteres)
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="amount">Monto a Pagar*</label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={newWallet.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                      <small className="form-hint">
                        Cantidad en pesos mexicanos (MXN)
                      </small>
                    </div>

                    <div className="form-group">
                      <label htmlFor="concept">Concepto de Pago*</label>
                      <textarea
                        id="concept"
                        name="concept"
                        value={newWallet.concept}
                        onChange={handleInputChange}
                        placeholder="Describe el concepto del pago..."
                        required
                        rows={3}
                        maxLength={200}
                      />
                      <small className="form-hint">
                        Descripción del pago (máximo 200 caracteres)
                      </small>
                    </div>

                    <div className="form-actions">
                      <button type="button" onClick={handleCancel} className="cancel-button">
                        Cancelar
                      </button>
                      <button type="submit" className="submit-button">
                        Agregar Wallet
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Lista de wallets existentes */}
            <div className="data-section">
              <div className="section-header">
                <h2>Wallets Registradas</h2>
                <span className="count-badge">{wallets.length} wallets</span>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Key de Wallet</th>
                      <th>Monto</th>
                      <th>Concepto</th>
                      <th>Fecha Creación</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <tr key={wallet.id}>
                        <td>{wallet.id}</td>
                        <td className="wallet-key">
                          <code>{wallet.walletKey}</code>
                        </td>
                        <td className="amount">
                          ${wallet.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="concept">
                          <span title={wallet.concept}>
                            {wallet.concept.length > 40 
                              ? `${wallet.concept.substring(0, 40)}...` 
                              : wallet.concept
                            }
                          </span>
                        </td>
                        <td>{new Date(wallet.dateCreated).toLocaleDateString('es-MX')}</td>
                        <td>
                          <span className={`status-badge ${wallet.status.toLowerCase()}`}>
                            {wallet.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-button" title="Editar">
                              ✏️
                            </button>
                            <button className="delete-button" title="Eliminar">
                              🗑️
                            </button>
                            <button className="view-button" title="Ver detalles">
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {wallets.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <h3>No hay wallets registradas</h3>
                  <p>Agrega la primera wallet para comenzar</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default AdminWallets;