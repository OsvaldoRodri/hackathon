import React from 'react';
import '../styles/App.css';
import '../styles/sign-up.css';
import Header from '../components/header';
import Footer from '../components/footer';

function SignUp(): React.JSX.Element {
  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="page-layout">
            <form>
              <div className="signup-container">
                <div className="signup-form">
                  <h1>Crear Nueva Cuenta*</h1>
                
                <div className="name-fields-group">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre*</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      placeholder="Ingresa tu nombre"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="apellidoPaterno">Apellido Paterno*</label>
                    <input 
                      type="text" 
                      id="apellidoPaterno" 
                      name="apellidoPaterno" 
                      placeholder="Ingresa tu apellido paterno"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="apellidoMaterno">Apellido Materno</label>
                  <input 
                    type="text" 
                    id="apellidoMaterno" 
                    name="apellidoMaterno" 
                    placeholder="Ingresa tu apellido materno"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico*</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="tu@email.com"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="telefono">Número de Teléfono*</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    name="telefono" 
                    placeholder="+52 123 456 7890"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="curp">CURP*</label>
                  <input 
                    type="text" 
                    id="curp" 
                    name="curp" 
                    placeholder="Número de identificación"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Contraseña*</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Crea una contraseña segura"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña*</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Confirma tu contraseña"
                    required 
                  />
                </div>
              </div>
              
              <div className="signup-form">
                <h1>Registrar Vivienda*</h1>
                
                <div className="address-fields-group">
                  <div className="form-group">
                    <label htmlFor="estado">Estado*</label>
                    <input 
                      type="text" 
                      id="estado" 
                      name="estado" 
                      placeholder="Ingresa el estado"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="municipio">Municipio*</label>
                    <input 
                      type="text" 
                      id="municipio" 
                      name="municipio" 
                      placeholder="Ingresa el municipio"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="colonia">Colonia*</label>
                    <input 
                      type="text" 
                      id="colonia" 
                      name="colonia" 
                      placeholder="Ingresa la colonia"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="calle">Calle*</label>
                    <input 
                      type="text" 
                      id="calle" 
                      name="calle" 
                      placeholder="Nombre de la calle"
                      required 
                    />
                  </div>
                </div>
                
                <div className="address-fields-group">
                  <div className="form-group">
                    <label htmlFor="numero">Número*</label>
                    <input 
                      type="text" 
                      id="numero" 
                      name="numero" 
                      placeholder="Número exterior e interior"
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="codigoPostal">C.P.*</label>
                    <input 
                      type="text" 
                      id="codigoPostal" 
                      name="codigoPostal" 
                      placeholder="Código postal"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tipoVivienda">Tipo de Vivienda*</label>
                  <select id="tipoVivienda" name="tipoVivienda" required>
                    <option value="">Selecciona un tipo</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="negocio">Negocio</option>
                  </select>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Crear Cuenta
                  </button>
                  <button type="button" className="btn-secondary">
                    ¿Ya tienes cuenta? Inicia Sesión
                  </button>
                </div>
              </div>
            </div>
          </form>
          
          <div className="animated-image-container">
            <div className="animated-image">
              <img src="/arrow.png" alt="flecha apuntando hacia abajo" />
            </div>
          </div>
        </div>
        
        {/* Texto central */}
        <div className="center-text-signup">
          <h2>¿Qué puedo hacer con QuickPays?</h2>
        </div>
        
        <div className="info-section">
          <div className="signup-container">
            <div className="signup-info">
              <h2>¡Únete a nuestra plataforma!</h2>
              <p>
                Crea tu cuenta para acceder a todos nuestros servicios de pago 
                de luz y agua de manera sencilla y segura.
              </p>
              <div className="benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Pagos rápidos y seguros</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Historial de pagos</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Recordatorios automáticos</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Soporte 24/7</span>
                </div>
              </div>
            </div>
            
            <div className="signup-info">
              <h2>¡Registra tu vivienda!</h2>
              <p>
                Registra tu casa o negocio en nuestra plataforma para gestionar 
                fácilmente tus pagos de servicios de luz y agua.
              </p>
              <div className="benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🏠</span>
                  <span>Gestiona múltiples propiedades</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Seguimiento de servicios de luz</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💧</span>
                  <span>Control de consumo de agua</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📊</span>
                  <span>Historial de consumos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default SignUp;
