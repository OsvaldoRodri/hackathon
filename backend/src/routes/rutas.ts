import express from 'express';
import usuariosRoutes from './usuarios.js';
import domiciliosRoutes from './domicilios.js';
import recibosRoutes from './recibos.js';
import { Recibo, Domicilio, Usuario } from '../models/index.js';

const router = express.Router();

// Rutas principales
router.use('/usuarios', usuariosRoutes);
router.use('/domicilios', domiciliosRoutes);
router.use('/recibos', recibosRoutes);

// Compatibilidad: Mantener ruta /duenos redirigiendo a /usuarios/duenos
router.use('/duenos', (req, res, next) => {
  req.url = '/usuarios/duenos' + req.url;
  usuariosRoutes(req, res, next);
});

// Ruta de información de la API
router.get('/', (_req, res) => {
  res.json({
    message: 'API del Sistema de Condominios',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      usuarios: [
        'GET /api/usuarios - Todos los usuarios',
        'GET /api/usuarios/duenos - Solo dueños',
        'GET /api/usuarios/admins - Solo administradores', 
        'GET /api/usuarios/tesoreros - Solo tesoreros',
        'GET /api/usuarios/:id - Usuario específico',
        'POST /api/usuarios - Crear usuario',
        'PUT /api/usuarios/:id - Actualizar usuario',
        'DELETE /api/usuarios/:id - Eliminar usuario',
        'PUT /api/usuarios/:id/toggle-status - Activar/desactivar'
      ],
      duenos: [
        'DEPRECATED: Use /api/usuarios/duenos',
        'GET /api/duenos -> /api/usuarios/duenos'
      ],
      domicilios: [
        'GET /api/domicilios',
        'GET /api/domicilios/:id',
        'POST /api/domicilios',
        'GET /api/domicilios/:id/recibos'
      ],
      recibos: [
        'GET /api/recibos',
        'GET /api/recibos/pendientes',
        'POST /api/recibos',
        'PUT /api/recibos/:id/pagar'
      ],
      reportes: [
        'GET /api/reportes/ingresos',
        'GET /api/reportes/estadisticas'
      ]
    }
  });
});

// Endpoint de reportes - Ingresos
router.get('/reportes/ingresos', async (_req, res) => {
  try {
    const ingresos = await Recibo.findAll({
      where: { estado: 'pagado' },
      attributes: ['monto', 'fechaPago', 'concepto', 'numero'],
      include: [{ 
        model: Domicilio, 
        attributes: ['numero', 'bloque'],
        include: [{ 
          model: Usuario, 
          as: 'propietario',
          attributes: ['nombre', 'apellido'] 
        }]
      }],
      order: [['fechaPago', 'DESC']]
    });
    
    const totalIngresos = ingresos.reduce((sum, recibo) => {
      return sum + parseFloat(recibo.monto.toString());
    }, 0);
    
    res.json({
      success: true,
      data: {
        totalIngresos,
        cantidadRecibos: ingresos.length,
        detalles: ingresos
      }
    });
  } catch (error) {
    console.error('Error al generar reporte de ingresos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al generar reporte de ingresos' 
    });
  }
});

// Endpoint de reportes - Estadísticas generales
router.get('/reportes/estadisticas', async (_req, res) => {
  try {
    const [
      totalUsuarios,
      totalDuenos,
      totalAdmins,
      totalTesoreros,
      totalDomicilios,
      totalRecibos,
      recibosPendientes
    ] = await Promise.all([
      Usuario.count(),
      Usuario.count({ where: { rol: 'dueno' } }),
      Usuario.count({ where: { rol: 'admin' } }),
      Usuario.count({ where: { rol: 'tesorero' } }),
      Domicilio.count(),
      Recibo.count(),
      Recibo.count({ where: { estado: 'pendiente' } })
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsuarios,
        totalDuenos,
        totalAdmins,
        totalTesoreros,
        totalDomicilios,
        totalRecibos,
        recibosPendientes,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al generar estadísticas' 
    });
  }
});

export default router;