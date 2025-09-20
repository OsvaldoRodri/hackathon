import React from 'react';
import '/styles/App.css'

function App(): React.JSX.Element {
  return (
    <div className="container">
      {/* Superior Izquierdo */}
      <div className="top-left">
        <h1>Realiza los pagos de tus servicios de luz y agua</h1>
      </div>

      {/* Superior Derecho */}
      <div className="top-right">
        <button>Soy Nuevo</button>
        <button>Ver mis pagos</button>
      </div>

      {/* Inferior Izquierdo */}
      <div className="bottom-left">
        <img src="ruta_de_tu_imagen.png" alt="Imagen ilustrativa" />
      </div>

      {/* Inferior Derecho */}
      <div className="bottom-right">
        <h3>Nosotros</h3>
        <p>Somos una organización dedicada a facilitar el pago de servicios en las comunidades rurales.</p>
        <p>Ofrecemos una plataforma sencilla y accesible para que los usuarios puedan gestionar sus pagos de manera eficiente.</p>
      </div>
    </div>
    )
export default App;