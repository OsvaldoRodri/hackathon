import React from 'react';
import './App.css';

function App(): React.JSX.Element {
  return (
    <div className="container">
      {/* Superior Izquierdo */}
      <div className="top-left">
        <h2>Realiza los pagos de tus servicios de luz y agua</h2>
      </div>

      {/* Superior Derecho */}
      <div className="top-right">
        <button>Registrar</button>
        <button>Acceder a pagos</button>
      </div>

      {/* Inferior Izquierdo */}
      <div className="bottom-left">
        <img src="ruta_de_tu_imagen.png" alt="Imagen ilustrativa" />
      </div>

      {/* Inferior Derecho */}
      <div className="bottom-right">
        <h3>Nosotros</h3>
        <p>Descripción de la organización, quiénes somos y qué ofrecemos.</p>
      </div>
    </div>
  );
}

export default App;