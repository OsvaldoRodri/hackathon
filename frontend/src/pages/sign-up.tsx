import React, { useState } from 'react';
import '../styles/App.css';
import '../styles/sign-up.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { apiService } from '../services/api';

interface SignUpForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  curp: string;
  password: string;
  confirmPassword: string;
  // Domicilio fields
  calle: string;
  numero: string;
  colonia: string;
  municipio: string;
  estado: string;
  tipo: 'apartamento' | 'casa' | 'local' | 'otro' | '';
}

function SignUp(): React.JSX.Element {
  const [formData, setFormData] = useState<SignUpForm>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    curp: '',
    password: '',
    confirmPassword: '',
    calle: '',
    numero: '',
    colonia: '',
    municipio: '',
    estado: '',
    tipo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    setSuccess('');

    try {
      // Validaciones del frontend - más flexibles
      if (!formData.nombre || !formData.email || !formData.password) {
        setError('Por favor completa al menos el nombre, email y contraseña');
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres');
        setIsLoading(false);
        return;
      }

      if (!formData.calle) {
        setError('Por favor ingresa al menos la calle de tu domicilio');
        setIsLoading(false);
        return;
      }

      if (!formData.tipo) {
        setError('Por favor selecciona el tipo de vivienda');
        setIsLoading(false);
        return;
      }

      // Crear usuario
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido || '', // Permitir apellido vacío
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || '', // Permitir teléfono vacío
        curp: formData.curp || '', // Permitir CURP vacío
        rol: 'dueno' as 'dueno'
      };
      
      console.log('Enviando datos de usuario:', userData);
      const userResponse = await apiService.signup(userData);

      if (userResponse.success) {
        console.log('Usuario creado exitosamente:', userResponse.data);
        
        // Crear domicilio asociado al usuario
        const domicilioData = {
          calle: formData.calle,
          numero: formData.numero || '', // Permitir número vacío
          colonia: formData.colonia || '', // Permitir colonia vacía
          municipio: formData.municipio || '', // Permitir municipio vacío
          estado: formData.estado || '', // Permitir estado vacío
          tipo: formData.tipo as 'apartamento' | 'casa' | 'local' | 'otro',
          duenoId: userResponse.data.id
        };
        
        console.log('Enviando datos de domicilio:', domicilioData);
        const domicilioResponse = await apiService.createDomicilio(domicilioData);

        if (domicilioResponse.success) {
          console.log('Domicilio creado exitosamente:', domicilioResponse.data);
          setSuccess('Cuenta creada exitosamente. Redirigiendo al login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          console.error('Error creando domicilio:', domicilioResponse);
          setError('Usuario creado pero error al registrar domicilio. Intenta iniciar sesión y agregar tu domicilio después.');
        }
      }
    } catch (error: any) {
      console.error('Error completo en registro:', error);
      
      // Proporcionar errores más específicos basados en la respuesta del servidor
      let errorMessage = 'Error al crear la cuenta.';
      
      // Si hay una respuesta del servidor, intentar extraer el mensaje de error
      if (error.response) {
        console.log('Error response status:', error.response.status);
        console.log('Error response data:', error.response.data);
        
        if (error.response.status === 400) {
          if (error.response.data?.details) {
            // Mostrar errores de validación específicos
            errorMessage = `Errores de validación: ${error.response.data.details.join(', ')}`;
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          } else {
            errorMessage = 'Datos inválidos. Por favor revisa todos los campos.';
          }
        } else if (error.response.status === 409) {
          errorMessage = 'El email o CURP ya están registrados en el sistema.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor intenta más tarde.';
        }
      } else if (error.message) {
        // Errores de red o otros errores
        if (error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica que el servidor esté ejecutándose en http://localhost:3000';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="page-layout">
            <form onSubmit={handleSubmit}>
              <div className="signup-container">
                {error && (
                  <div className="message message-error">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="message message-success">
                    {success}
                  </div>
                )}

                <div className="signup-form">
                  <h1>Crear Nueva Cuenta</h1>
                  <p className="form-description">Los campos marcados con * son obligatorios</p>
                  
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre*</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      placeholder="Ingresa tu nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input 
                      type="text" 
                      id="apellido" 
                      name="apellido" 
                      placeholder="Ingresa tu apellido (opcional)"
                      value={formData.apellido}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Correo Electrónico*</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="telefono">Número de Teléfono</label>
                    <input 
                      type="tel" 
                      id="telefono" 
                      name="telefono" 
                      placeholder="+52 123 456 7890 (opcional)"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="curp">CURP</label>
                    <input 
                      type="text" 
                      id="curp" 
                      name="curp" 
                      placeholder="Clave Única de Registro de Población (opcional)"
                      value={formData.curp}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Contraseña*</label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      placeholder="Mínimo 4 caracteres"
                      value={formData.password}
                      onChange={handleInputChange}
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
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className="signup-form">
                  <h1>Registrar Vivienda</h1>
                  <p className="form-description">Solo la calle y el tipo de vivienda son obligatorios</p>
                  
                  <div className="form-group">
                    <label htmlFor="calle">Calle*</label>
                    <input 
                      type="text" 
                      id="calle" 
                      name="calle" 
                      placeholder="Nombre de la calle"
                      value={formData.calle}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="numero">Número</label>
                    <input 
                      type="text" 
                      id="numero" 
                      name="numero" 
                      placeholder="Número de casa/apartamento (opcional)"
                      value={formData.numero}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="colonia">Colonia</label>
                    <input 
                      type="text" 
                      id="colonia" 
                      name="colonia" 
                      placeholder="Nombre de la colonia (opcional)"
                      value={formData.colonia}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="municipio">Municipio</label>
                    <input 
                      type="text" 
                      id="municipio" 
                      name="municipio" 
                      placeholder="Nombre del municipio (opcional)"
                      value={formData.municipio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado">Estado</label>
                    <input 
                      type="text" 
                      id="estado" 
                      name="estado" 
                      placeholder="Nombre del estado (opcional)"
                      value={formData.estado}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tipo">Tipo de Vivienda*</label>
                    <select 
                      id="tipo" 
                      name="tipo" 
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="local">Local/Negocio</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creando Cuenta...' : 'Crear Cuenta'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={handleLoginRedirect}
                    >
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