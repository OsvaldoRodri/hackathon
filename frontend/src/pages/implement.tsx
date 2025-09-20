import React, { useState } from 'react';
import '../styles/App.css';
import '../styles/implement.css';
import Header from '../components/header';
import Footer from '../components/footer';

function Implement(): React.JSX.Element {
  const [formData, setFormData] = useState({
    nombreSolicitante: '',
    nombreComunidad: '',
    telefonoSolicitante: '',
    codigoPostal: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulamos el envío de la solicitud
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      console.log('Solicitud enviada:', formData);
    }, 2000);
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main>
          <div className="main-content">
            <div className="success-container">
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h1>¡Solicitud Enviada Exitosamente!</h1>
                <p>
                  Gracias por tu interés en implementar QuickPay en tu comunidad.
                  Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo
                  en un plazo máximo de 48 horas.
                </p>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      nombreSolicitante: '',
                      nombreComunidad: '',
                      telefonoSolicitante: '',
                      codigoPostal: ''
                    });
                  }}
                  className="btn-primary"
                >
                  Enviar Nueva Solicitud
                </button>
              </div>
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
          <div className="implement-container">
            
            {/* Sección de información */}
            <div className="info-section">
              <h1>Implementar QuickPay en tu Comunidad</h1>
              <p>
                ¿Te interesa que QuickPay llegue a tu comunidad? Completa este formulario
                de solicitud y nuestro equipo evaluará la viabilidad de implementar
                nuestros servicios de pago de luz y agua en tu área.
              </p>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">🏘️</span>
                  <span>Servicios de pago localizados</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💡</span>
                  <span>Facilita el pago de luz y agua</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📱</span>
                  <span>Tecnología accesible</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🤝</span>
                  <span>Apoyo comunitario</span>
                </div>
              </div>
            </div>

            {/* Formulario de solicitud */}
            <div className="form-section">
              <form onSubmit={handleSubmit} className="implement-form">
                <h2>Formulario de Solicitud</h2>
                
                <div className="form-group">
                  <label htmlFor="nombreSolicitante">Nombre del Solicitante*</label>
                  <input
                    type="text"
                    id="nombreSolicitante"
                    name="nombreSolicitante"
                    value={formData.nombreSolicitante}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nombreComunidad">Nombre de la Comunidad*</label>
                  <input
                    type="text"
                    id="nombreComunidad"
                    name="nombreComunidad"
                    value={formData.nombreComunidad}
                    onChange={handleInputChange}
                    placeholder="Nombre de tu comunidad o localidad"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefonoSolicitante">Teléfono del Solicitante*</label>
                  <input
                    type="tel"
                    id="telefonoSolicitante"
                    name="telefonoSolicitante"
                    value={formData.telefonoSolicitante}
                    onChange={handleInputChange}
                    placeholder="+52 123 456 7890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="codigoPostal">Código Postal de la Comunidad*</label>
                  <input
                    type="text"
                    id="codigoPostal"
                    name="codigoPostal"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    placeholder="12345"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Enviando Solicitud...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Implement;