import React from 'react';
import '../styles/App.css';
import '../styles/about.css';
import Header from '../components/header';
import Footer from '../components/footer';

function About(): React.JSX.Element {
  return (
    <>
      <Header />
      <main>
        <div className="main-content">
          <div className="about-container">
            
            {/* Hero Section */}
            <div className="hero-section">
              <h1>Conoce QuickPay</h1>
              <p className="hero-subtitle">
                Transformando la gestión de servicios básicos en comunidades de México
              </p>
            </div>

            {/* Quiénes somos */}
            <section className="section who-we-are">
              <div className="section-header">
                <h2>Quiénes somos</h2>
                <div className="section-icon">🏢</div>
              </div>
              <div className="section-content">
                <p>
                  En QuickPay estamos comprometidos con transformar la manera en que las comunidades 
                  gestionan sus servicios básicos. Creemos que el acceso a sistemas de pago simples, 
                  seguros y transparentes debe ser un derecho para todos, sin importar el lugar donde 
                  vivan ni las barreras tecnológicas que enfrenten.
                </p>
              </div>
            </section>

            {/* Qué hacemos */}
            <section className="section what-we-do">
              <div className="section-header">
                <h2>Qué hacemos</h2>
                <div className="section-icon">⚡</div>
              </div>
              <div className="section-content">
                <p>
                  Desarrollamos una plataforma digital pensada para comunidades rurales y semiurbanas 
                  que permite simplificar el pago de servicios esenciales como agua y electricidad. 
                  Nuestra solución ofrece recibos digitales, pagos en línea desde dispositivos móviles 
                  y la opción de domiciliación automática para adultos mayores o personas con poca 
                  experiencia tecnológica.
                </p>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📱</div>
                    <h3>Recibos Digitales</h3>
                    <p>Accede a tus recibos desde cualquier dispositivo móvil</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💳</div>
                    <h3>Pagos en Línea</h3>
                    <p>Realiza pagos seguros desde la comodidad de tu hogar</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🔄</div>
                    <h3>Domiciliación</h3>
                    <p>Pagos automáticos para mayor comodidad</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">👥</div>
                    <h3>Inclusivo</h3>
                    <p>Diseñado para todas las edades y niveles tecnológicos</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Nuestro propósito */}
            <section className="section our-purpose">
              <div className="section-header">
                <h2>Nuestro propósito</h2>
                <div className="section-icon">🎯</div>
              </div>
              <div className="section-content">
                <div className="purpose-grid">
                  <div className="purpose-item">
                    <div className="purpose-icon">🌍</div>
                    <h3>Inclusión Financiera</h3>
                    <p>
                      Impulsar la inclusión financiera, acercando herramientas digitales 
                      a comunidades históricamente rezagadas.
                    </p>
                  </div>
                  <div className="purpose-item">
                    <div className="purpose-icon">🔍</div>
                    <h3>Transparencia</h3>
                    <p>
                      Fomentar la transparencia y confianza en la gestión comunitaria 
                      de servicios.
                    </p>
                  </div>
                  <div className="purpose-item">
                    <div className="purpose-icon">✈️</div>
                    <h3>Apoyo a Migrantes</h3>
                    <p>
                      Apoyar a migrantes y sus familias, facilitando pagos directos 
                      desde el extranjero.
                    </p>
                  </div>
                  <div className="purpose-item">
                    <div className="purpose-icon">🌱</div>
                    <h3>Sostenibilidad</h3>
                    <p>
                      Contribuir a la sostenibilidad, reduciendo el uso de papel 
                      y traslados innecesarios.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Nuestra visión */}
            <section className="section our-vision">
              <div className="section-header">
                <h2>Nuestra visión</h2>
                <div className="section-icon">🔮</div>
              </div>
              <div className="section-content vision-content">
                <p>
                  Construir un futuro donde cada comunidad pueda gestionar de manera justa, 
                  eficiente y digital sus servicios básicos, fortaleciendo la organización 
                  local y mejorando la calidad de vida de sus habitantes.
                </p>
              </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
              <h2>¿Tu comunidad necesita QuickPay?</h2>
              <p>Únete a nosotros en la transformación digital de los servicios básicos</p>
              <button 
                onClick={() => {window.location.href="/implement"}}
                className="cta-button"
              >
                Implementar en mi comunidad
              </button>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default About;