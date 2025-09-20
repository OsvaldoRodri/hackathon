import express from 'express';
import { Recibo, Domicilio, Usuario } from '../models/index.js';
import { WalletService } from '../services/walletService.js';

const router = express.Router();

// Instanciar el servicio de wallet
const walletService = new WalletService();

// GET /api/recibos - Obtener todos los recibos
router.get('/', async (req, res) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    
    const whereCondition: any = {};
    if (estado) {
      whereCondition.estado = estado;
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const { count, rows: recibos } = await Recibo.findAndCountAll({
      where: whereCondition,
      include: [{ 
        model: Domicilio, 
        include: [{ 
          model: Usuario, 
          as: 'propietario',
          attributes: ['nombre', 'apellido'] 
        }] 
      }],
      order: [['fechaVencimiento', 'DESC']],
      limit: Number(limit),
      offset: offset
    });
    
    res.json({
      success: true,
      data: recibos,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener recibos' 
    });
  }
});

// GET /api/recibos/pendientes - Obtener recibos pendientes
router.get('/pendientes', async (_req, res) => {
  try {
    const recibosPendientes = await Recibo.findAll({
      where: { estado: 'pendiente' },
      include: [{ 
        model: Domicilio, 
        include: [{ 
          model: Usuario, 
          as: 'propietario',
          attributes: ['nombre', 'apellido'] 
        }] 
      }],
      order: [['fechaVencimiento', 'ASC']]
    });
    
    res.json({
      success: true,
      data: recibosPendientes,
      total: recibosPendientes.length
    });
  } catch (error) {
    console.error('Error al obtener recibos pendientes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener recibos pendientes' 
    });
  }
});

// POST /api/recibos - Crear nuevo recibo
router.post('/', async (req, res) => {
  try {
    const { numero, concepto, monto, fechaVencimiento, domicilioId } = req.body;
    
    // Verificar que el domicilio existe
    const domicilio = await Domicilio.findByPk(domicilioId);
    if (!domicilio) {
      return res.status(400).json({
        success: false,
        error: 'El domicilio especificado no existe'
      });
    }
    
    const nuevoRecibo = await Recibo.create({
      numero,
      concepto,
      monto,
      fechaVencimiento,
      domicilioId
    });
    
    return res.status(201).json({
      success: true,
      data: nuevoRecibo,
      message: 'Recibo creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear recibo:', error);
    return res.status(400).json({ 
      success: false, 
      error: 'Error al crear recibo' 
    });
  }
});

// PUT /api/recibos/:id/pagar - Marcar recibo como pagado usando OpenPayments
router.put('/:id/pagar', async (req, res) => {
  try {
    const { userId, walletCode } = req.body;
    
    const recibo = await Recibo.findByPk(req.params.id, {
      include: [{ 
        model: Domicilio, 
        include: [{ 
          model: Usuario, 
          as: 'propietario' 
        }] 
      }]
    });
    
    if (!recibo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recibo no encontrado' 
      });
    }
    
    if (recibo.estado === 'pagado') {
      return res.status(400).json({
        success: false,
        error: 'El recibo ya está marcado como pagado'
      });
    }

    // Validación básica de parámetros
    if (!userId || !walletCode) {
      return res.status(400).json({
        success: false,
        error: 'userId y walletCode son requeridos para procesar el pago'
      });
    }

    // Obtener wallet del usuario pagador
    const userWallet = await walletService.getUserWallet(parseInt(userId));
    if (!userWallet) {
      return res.status(400).json({
        success: false,
        error: 'Usuario no tiene una wallet configurada'
      });
    }

    // Validar que el walletCode coincida con la wallet del usuario
    if (userWallet.walletUrl !== walletCode) {
      return res.status(400).json({
        success: false,
        error: 'El código de wallet no coincide con la wallet del usuario'
      });
    }

    // Obtener wallet del tesorero
    const treasurerWallet = await walletService.getTreasurerWallet();
    if (!treasurerWallet) {
      return res.status(500).json({
        success: false,
        error: 'No se encontró la wallet del tesorero. Contacte al administrador.'
      });
    }

    // Procesar el pago usando OpenPayments
    const paymentResult = await walletService.processPayment({
      reciboId: parseInt(req.params.id),
      senderUserId: parseInt(userId),
      receiverUserId: treasurerWallet.userId,
      amount: parseFloat(recibo.monto.toString()),
      description: `Pago de ${recibo.concepto} - Recibo ${recibo.numero}`
    });

    if (paymentResult.success) {
      // Marcar el recibo como pagado
      await recibo.update({
        estado: 'pagado',
        fechaPago: new Date()
      });

      return res.json({
        success: true,
        data: recibo,
        transaction: {
          id: paymentResult.transactionId,
          openPaymentsId: paymentResult.openPaymentsTransactionId
        },
        message: 'Pago procesado exitosamente usando OpenPayments'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: paymentResult.error || 'Error al procesar el pago',
        message: paymentResult.message
      });
    }

  } catch (error) {
    console.error('Error al procesar pago:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al procesar el pago' 
    });
  }
});

// GET /api/recibos/:id - Obtener recibo específico
router.get('/:id', async (req, res) => {
  try {
    const recibo = await Recibo.findByPk(req.params.id, {
      include: [{ 
        model: Domicilio, 
        include: [{ 
          model: Usuario, 
          as: 'propietario',
          attributes: ['nombre', 'apellido', 'email'] 
        }] 
      }]
    });
    
    if (!recibo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recibo no encontrado' 
      });
    }
    
    return res.json({
      success: true,
      data: recibo
    });
  } catch (error) {
    console.error('Error al obtener recibo:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener recibo' 
    });
  }
});

// PUT /api/recibos/:id - Actualizar recibo
router.put('/:id', async (req, res) => {
  try {
    const recibo = await Recibo.findByPk(req.params.id);
    
    if (!recibo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recibo no encontrado' 
      });
    }

    // Si se cambia el domicilio, verificar que existe
    if (req.body.domicilioId) {
      const domicilio = await Domicilio.findByPk(req.body.domicilioId);
      if (!domicilio) {
        return res.status(400).json({
          success: false,
          error: 'El domicilio especificado no existe'
        });
      }
    }
    
    await recibo.update(req.body);
    
    return res.json({
      success: true,
      data: recibo,
      message: 'Recibo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar recibo:', error);
    return res.status(400).json({ 
      success: false, 
      error: 'Error al actualizar recibo' 
    });
  }
});

// DELETE /api/recibos/:id - Eliminar recibo
router.delete('/:id', async (req, res) => {
  try {
    const recibo = await Recibo.findByPk(req.params.id);
    
    if (!recibo) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recibo no encontrado' 
      });
    }

    // No permitir eliminar recibos ya pagados
    if (recibo.estado === 'pagado') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un recibo que ya está pagado'
      });
    }
    
    await recibo.destroy();
    
    return res.json({
      success: true,
      message: 'Recibo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar recibo:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar recibo' 
    });
  }
});

export default router;