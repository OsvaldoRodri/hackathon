import React, { useState } from 'react';
import '../styles/App.css';
import '../styles/login.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { apiService } from '../services/api';

function Login(): React.JSX.Element {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Por favor completa todos los campos');
        setIsLoading(false);
        return;
      }

      const response = await apiService.login(formData);
      
      if (response.success) {
        const { user } = response.data;
        
        // Redirigir según el rol del usuario
        switch (user.rol) {
          case 'admin':
            window.location.href = "/admin";
            break;
          case 'tesorero':
            window.location.href = "/treasurer";
            break;
          case 'dueno':
          default:
            window.location.href = "/payments";
            break;
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Credenciales inválidas o error del servidor');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="login-container">
            
            {/* Información de bienvenida */}
            <div className="welcome-section">
              <h1>¡Bienvenido de vuelta!</h1>
              <p>
                Accede a tu cuenta para gestionar tus pagos de servicios 
                de luz y agua de manera rápida y segura.
              </p>
              
              <div className="login-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🔒</span>
                  <span>Acceso seguro a tu cuenta</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📊</span>
                  <span>Historial completo de pagos</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Pagos rápidos y fáciles</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔔</span>
                  <span>Recordatorios automáticos</span>
                </div>
              </div>

              <div className="demo-info">
                <h3>🧪 Modo Demo</h3>
                <p>
                  <strong>Usuario normal:</strong> Cualquier email y contraseña<br/>
                  <strong>Administrador:</strong> admin@quickpay.com / admin123<br/>
                  <strong>Tesorero:</strong> tesorero@quickpay.com / tesorero123
                </p>
              </div>
            </div>

            {/* Formulario de login */}
            <div className="form-section">
              <form onSubmit={handleSubmit} className="login-form">
                <h2>Iniciar Sesión</h2>
                
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Tu contraseña"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>

                <div className="form-footer">
                  <p>¿No tienes una cuenta?</p>
                  <button 
                    type="button"
                    onClick={() => {window.location.href="/sign-up"}}
                    className="signup-link"
                  >
                    Crear cuenta nueva
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Login;
