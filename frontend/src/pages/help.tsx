import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../styles/help.css';

const Help: React.FC = () => {
  return (
    <div className="help-page">
      <Header />
      <main className="help-main">
        <div className="help-container">
          <h1>Centro de Ayuda</h1>
          
          {/* Información de Contacto */}
          <section className="contact-section">
            <h2>Información de Contacto</h2>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong>
                <span>soporte@quickpay.com</span>
              </div>
              <div className="contact-item">
                <strong>Teléfono:</strong>
                <span>+52 (449) 123-4567</span>
              </div>
            </div>
          </section>

          {/* Preguntas Frecuentes */}
          <section className="faq-section">
            <h2>Preguntas Frecuentes</h2>
            
            <div className="faq-item">
              <h3>¿Cómo puedo registrarme en la plataforma?</h3>
              <p>Para registrarte, haz clic en el botón "Registrarse" en la página principal, completa el formulario con tus datos personales y sigue las instrucciones que recibirás por email.</p>
            </div>

            <div className="faq-item">
              <h3>¿Cómo realizo un pago?</h3>
              <p>Puedes realizar pagos a través de la sección "Pagos" en tu panel de usuario. Aceptamos tarjetas de crédito, débito y transferencias bancarias.</p>
            </div>

            <div className="faq-item">
              <h3>¿Puedo cambiar mis datos personales?</h3>
              <p>Sí, puedes actualizar tu información personal desde tu perfil de usuario. Ve a "Mi Perfil" y edita los campos que necesites modificar.</p>
            </div>

            <div className="faq-item">
              <h3>¿Cómo reporto un problema técnico?</h3>
              <p>Si experimentas problemas técnicos, puedes contactarnos a través del email de soporte o llamar a nuestro número de teléfono durante horario de oficina.</p>
            </div>

            <div className="faq-item">
              <h3>¿Cuáles son los horarios de atención?</h3>
              <p>Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Los fines de semana ofrecemos soporte limitado por email.</p>
            </div>

            <div className="faq-item">
              <h3>¿Cómo puedo solicitar un reembolso?</h3>
              <p>Para solicitar un reembolso, contacta a nuestro equipo de soporte con los detalles de tu transacción. Procesamos las solicitudes en un plazo de 5-7 días hábiles.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;