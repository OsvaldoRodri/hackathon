import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';
import '../styles/admin-management.css';
import Header from '../components/header';
import Footer from '../components/footer';

interface Wallet {
  id: number;
  walletKey: string;
  ownerName: string;
  description: string;
}

function AdminWallets(): React.JSX.Element {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Estados para el formulario
  const [newWallet, setNewWallet] = useState({
    walletKey: '',
    ownerName: '',
    description: ''
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
      ownerName: newWallet.ownerName,
      description: newWallet.description
    };
    
    setWallets([...wallets, newWalletItem]);
    setNewWallet({ walletKey: '', ownerName: '', description: '' });
    setShowAddWalletForm(false);
  };

  const handleCancel = () => {
    setNewWallet({ walletKey: '', ownerName: '', description: '' });
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
              <div className="wallet-modal-overlay">
                <div className="wallet-modal">
                  <div className="wallet-modal-header">
                    <div className="modal-icon">
                      <span>💳</span>
                    </div>
                    <h2>Nueva Wallet</h2>
                    <p>Agrega una nueva wallet al sistema</p>
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
                      <div className="input-group">
                        <div className="input-icon">🔑</div>
                        <div className="input-content">
                          <label htmlFor="walletKey">Key de la Wallet</label>
                          <input
                            type="text"
                            id="walletKey"
                            name="walletKey"
                            value={newWallet.walletKey}
                            onChange={handleInputChange}
                            placeholder="$ilp.interledger-test.dev/a1738327"
                            required
                            maxLength={100}
                          />
                          <span className="input-help">
                            Formato: $ilp.interledger-test.dev/account
                          </span>
                        </div>
                      </div>

                      <div className="input-group">
                        <div className="input-icon">👤</div>
                        <div className="input-content">
                          <label htmlFor="ownerName">Propietario</label>
                          <input
                            type="text"
                            id="ownerName"
                            name="ownerName"
                            value={newWallet.ownerName}
                            onChange={handleInputChange}
                            placeholder="Nombre completo del propietario"
                            required
                            maxLength={100}
                          />
                          <span className="input-help">
                            Nombre de la persona propietaria
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
                            value={newWallet.description}
                            onChange={handleInputChange}
                            placeholder="Describe el uso o propósito de esta wallet..."
                            required
                            rows={3}
                            maxLength={200}
                          />
                          <span className="input-help">
                            Máximo 200 caracteres • {200 - newWallet.description.length} restantes
                          </span>
                        </div>
                      </div>

                      <div className="modal-actions">
                        <button type="button" onClick={handleCancel} className="btn-secondary">
                          <span>↩️</span>
                          Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                          <span>💾</span>
                          Agregar Wallet
                        </button>
                      </div>
                    </form>
                  </div>
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
                      <th>Propietario</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <tr key={wallet.id}>
                        <td>{wallet.id}</td>
                        <td className="wallet-key">
                          <code>{wallet.walletKey}</code>
                        </td>
                        <td className="owner-name">
                          {wallet.ownerName}
                        </td>
                        <td className="description">
                          <span title={wallet.description}>
                            {wallet.description.length > 40 
                              ? `${wallet.description.substring(0, 40)}...` 
                              : wallet.description
                            }
                          </span>
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