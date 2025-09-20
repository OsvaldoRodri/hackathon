// Script de prueba para verificar el registro de usuarios
const testData = {
  nombre: "Juan",
  apellido: "Pérez",
  email: "juan.perez@email.com",
  curp: "JUPJ900101HDFRRN01", // CURP de prueba
  telefono: "5551234567"
};

const domicilioData = {
  calle: "Av. Reforma",
  numero: "123",
  colonia: "Centro",
  municipio: "Ciudad de México",
  estado: "CDMX"
};

console.log("Datos de prueba para usuario:");
console.log(JSON.stringify(testData, null, 2));

console.log("\nDatos de prueba para domicilio:");
console.log(JSON.stringify(domicilioData, null, 2));

// Test con fetch (para usar en el navegador)
const testRegistration = async () => {
  try {
    // 1. Registrar usuario
    const userResponse = await fetch('http://localhost:3001/api/duenos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      throw new Error(`Error registrando usuario: ${userResponse.status} - ${errorData}`);
    }
    
    const userData = await userResponse.json();
    console.log("Usuario registrado exitosamente:", userData);
    
    // 2. Crear domicilio para el usuario
    const domicilioWithUser = {
      ...domicilioData,
      dueno_id: userData.id
    };
    
    const domicilioResponse = await fetch('http://localhost:3001/api/domicilios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(domicilioWithUser)
    });
    
    if (!domicilioResponse.ok) {
      const errorData = await domicilioResponse.text();
      throw new Error(`Error creando domicilio: ${domicilioResponse.status} - ${errorData}`);
    }
    
    const domicilioResult = await domicilioResponse.json();
    console.log("Domicilio creado exitosamente:", domicilioResult);
    
    return { user: userData, domicilio: domicilioResult };
    
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    throw error;
  }
};

// Para usar en Node.js, descomenta esto:
/*
import fetch from 'node-fetch';
testRegistration().then(result => {
  console.log("Proceso completado:", result);
}).catch(error => {
  console.error("Error:", error);
});
*/

console.log("\nPara probar en el navegador, abre la consola y ejecuta:");
console.log("testRegistration()");