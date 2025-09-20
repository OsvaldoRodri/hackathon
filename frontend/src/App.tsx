import React from 'react';
import './styles/App.css';
import Header from './components/header';
import Footer from './components/footer';

function App(): React.JSX.Element {
  return (
    <>
      <Header />
      <main>
      <div className="main-content">
        <div className="container">
          {/* Superior Izquierdo */}
          <div className="top-left">
            <h1>Realiza los pagos de tus servicios de luz y agua</h1>
          </div>

          {/* Superior Derecho boton con link a sign-up y payments */}
          <div className="top-right">
            <button onClick={() => {window.location.href="/sign-up"}}>Soy Nuevo

            </button>
            <button onClick={() => {window.location.href="/payments"}}>Ver mis pagos
            </button>
          </div>

          {/* Inferior Izquierdo */}
          <div className="bottom-left">
            <img src="/persona.png?v=2" alt="Persona realizando pagos de servicios" />
          </div>

          {/* Inferior Derecho */}
          <div className="bottom-right">
            <h3>Nosotros</h3>
            <p>Somos una organización dedicada a facilitar el pago de servicios en las comunidades rurales.</p>
            <p>Ofrecemos una plataforma sencilla y accesible para que los usuarios puedan gestionar sus pagos de manera eficiente.</p>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

export default App;