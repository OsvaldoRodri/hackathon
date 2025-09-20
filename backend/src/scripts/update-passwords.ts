import bcrypt from 'bcrypt';
import { sequelize, Usuario } from '../models/index.js';

async function updatePasswordsToHash() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();

    console.log('📊 Obteniendo usuarios con contraseñas en texto plano...');
    const usuarios = await Usuario.findAll();

    console.log(`📋 Encontrados ${usuarios.length} usuarios`);

    for (const usuario of usuarios) {
      const userData = usuario.get({ plain: true });
      console.log(`👤 Procesando usuario ID: ${userData.id}, Email: ${userData.email}`);
      
      // Verificar si la contraseña existe y no está hasheada ya
      if (userData.password && !userData.password.startsWith('$2') && userData.password.length < 50) {
        console.log(`🔐 Hasheando contraseña para usuario: ${userData.email}`);
        
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await usuario.update({ password: hashedPassword });
        
        console.log(`✅ Contraseña actualizada para: ${userData.email}`);
      } else if (!userData.password) {
        console.log(`⚠️  Usuario ${userData.email} no tiene contraseña definida`);
      } else {
        console.log(`⏭️  Usuario ${userData.email} ya tiene contraseña hasheada`);
      }
    }

    console.log('✅ Proceso completado exitosamente');

    // Mostrar resumen de usuarios
    console.log('\n📋 Resumen de usuarios en la base de datos:');
    for (const usuario of usuarios) {
      const userData = usuario.get({ plain: true });
      console.log(`- ${userData.email} (${userData.rol}) - Activo: ${userData.activo}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
updatePasswordsToHash();