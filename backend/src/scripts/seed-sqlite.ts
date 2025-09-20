import { sequelize, Usuario, Domicilio, Recibo } from '../models/index-sqlite.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeding de la base de datos (SQLite)...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');
    
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: true }); // force: true recrea las tablas
    console.log('✅ Tablas creadas/actualizadas.');
    
    // Crear usuarios con diferentes roles
    
    // 1. Crear administradores
    const administradores = await Usuario.bulkCreate([
      {
        nombre: 'Juan Carlos',
        apellido: 'Rodríguez',
        email: 'admin@condominio.com',
        password: 'admin123', // En producción esto debe ser hasheado
        telefono: '555-0001',
        curp: '10000001',
        rol: 'admin',
        activo: true
      },
      {
        nombre: 'María',
        apellido: 'González',
        email: 'maria.admin@condominio.com',
        password: 'admin123',
        telefono: '555-0002',
        curp: '10000002',
        rol: 'admin',
        activo: true
      }
    ]);
    console.log('✅ Administradores creados:', administradores.length);
    
    // 2. Crear tesoreros
    const tesoreros = await Usuario.bulkCreate([
      {
        nombre: 'Carlos',
        apellido: 'Mendoza',
        email: 'tesorero@condominio.com',
        password: 'tesorero123',
        telefono: '555-0101',
        curp: '20000001',
        rol: 'tesorero',
        activo: true
      },
      {
        nombre: 'Ana',
        apellido: 'Vásquez',
        email: 'ana.tesorero@condominio.com',
        password: 'tesorero123',
        telefono: '555-0102',
        curp: '20000002',
        rol: 'tesorero',
        activo: true
      }
    ]);
    console.log('✅ Tesoreros creados:', tesoreros.length);
    
    // 3. Crear dueños de propiedades
    const duenos = await Usuario.bulkCreate([
      {
        nombre: 'Pedro',
        apellido: 'García',
        email: 'pedro.garcia@email.com',
        password: 'dueno123',
        telefono: '555-1001',
        curp: '12345678',
        rol: 'dueno'
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'ana.martinez@email.com',
        password: 'dueno123',
        telefono: '555-1002',
        curp: '23456789',
        rol: 'dueno'
      },
      {
        nombre: 'Luis',
        apellido: 'Rodriguez',
        email: 'luis.rodriguez@email.com',
        password: 'dueno123',
        telefono: '555-1003',
        curp: '34567890',
        rol: 'dueno'
      },
      {
        nombre: 'Carmen',
        apellido: 'López',
        email: 'carmen.lopez@email.com',
        password: 'dueno123',
        telefono: '555-1004',
        curp: '45678901',
        rol: 'dueno'
      },
      {
        nombre: 'Miguel',
        apellido: 'Hernández',
        email: 'miguel.hernandez@email.com',
        password: 'dueno123',
        telefono: '555-1005',
        curp: '56789012',
        rol: 'dueno'
      }
    ]);
    console.log('✅ Dueños creados:', duenos.length);
    
    // Crear domicilios de ejemplo
    const domicilios = await Domicilio.bulkCreate([
      {
        numero: '101',
        bloque: 'A',
        area: 85.5,
        tipo: 'apartamento',
        duenoId: duenos[0]!.id
      },
      {
        numero: '102',
        bloque: 'A',
        area: 92.0,
        tipo: 'apartamento',
        duenoId: duenos[1]!.id
      },
      {
        numero: '201',
        bloque: 'B',
        area: 110.5,
        tipo: 'apartamento',
        duenoId: duenos[2]!.id
      },
      {
        numero: '301',
        bloque: 'C',
        area: 120.0,
        tipo: 'casa',
        duenoId: duenos[3]!.id
      },
      {
        numero: 'L1',
        bloque: 'PB',
        area: 45.0,
        tipo: 'local',
        duenoId: duenos[4]!.id
      }
    ]);
    console.log('✅ Domicilios creados:', domicilios.length);
    
    // Crear recibos de ejemplo
    const recibos = [];
    const conceptos = ['Cuota de administración', 'Fondo de reserva', 'Servicios comunes', 'Mantenimiento', 'Seguridad'];
    
    for (let i = 0; i < domicilios.length; i++) {
      const domicilio = domicilios[i]!;
      
      // Crear 3 recibos por domicilio
      for (let j = 1; j <= 3; j++) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + j);
        
        const estado = j === 1 ? 'pagado' : (j === 2 ? 'pendiente' : 'pendiente');
        const fechaPago = estado === 'pagado' ? new Date() : null;
        
        recibos.push({
          numero: `REC-${domicilio.id}-${j.toString().padStart(3, '0')}`,
          concepto: conceptos[j % conceptos.length]!,
          monto: Math.floor(Math.random() * 100000) + 50000, // Entre 50,000 y 150,000
          fechaVencimiento,
          fechaPago,
          estado,
          domicilioId: domicilio.id
        });
      }
    }
    
    const recibosCreados = await Recibo.bulkCreate(recibos);
    console.log('✅ Recibos creados:', recibosCreados.length);
    
    console.log('🎉 Seeding completado exitosamente!');
    console.log(`
📊 Resumen de datos creados:
   - ${administradores.length} Administradores (rol: admin)
   - ${tesoreros.length} Tesoreros (rol: tesorero)  
   - ${duenos.length} Dueños (rol: dueno)
   - ${domicilios.length} Domicilios
   - ${recibosCreados.length} Recibos
   
👥 Total de usuarios: ${administradores.length + tesoreros.length + duenos.length}

🔐 Credenciales de prueba:
   - Admin: admin@condominio.com / admin123
   - Tesorero: tesorero@condominio.com / tesorero123
   - Dueño: pedro.garcia@email.com / dueno123
`);
    
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada.');
    process.exit(0);
  }
};

// Ejecutar el seeding si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
