import express from 'express';
import { walletService } from '../services/walletService.js';
import { Wallet } from '../models/index.js';

const router = express.Router();

// GET /api/wallets/user/:userId - Obtener wallet de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario inválido'
      });
    }

    const wallet = await walletService.getUserWallet(userId);
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet no encontrada para este usuario'
      });
    }

    return res.json({
      success: true,
      data: {
        id: wallet.id,
        walletUrl: wallet.walletUrl,
        balance: wallet.balance,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt
      }
    });
  } catch (error) {
    console.error('Error al obtener wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/wallets - Crear nueva wallet
router.post('/', async (req, res) => {
  try {
    const { userId, walletUrl, publicKey } = req.body;

    if (!userId || !walletUrl || !publicKey) {
      return res.status(400).json({
        success: false,
        error: 'userId, walletUrl y publicKey son requeridos'
      });
    }

    // Validar formato de wallet URL
    if (!walletUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'walletUrl debe ser una URL válida'
      });
    }

    const wallet = await walletService.createWallet({
      userId: parseInt(userId),
      walletUrl,
      publicKey
    });

    if (!wallet) {
      return res.status(400).json({
        success: false,
        error: 'No se pudo crear la wallet. Verifica que la URL sea válida y el usuario no tenga ya una wallet'
      });
    }

    return res.status(201).json({
      success: true,
      data: wallet,
      message: 'Wallet creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/wallets/treasurer - Obtener wallet del tesorero
router.get('/treasurer', async (_req, res) => {
  try {
    const wallet = await walletService.getTreasurerWallet();
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró wallet del tesorero'
      });
    }

    return res.json({
      success: true,
      data: {
        id: wallet.id,
        walletUrl: wallet.walletUrl,
        balance: wallet.balance,
        isActive: wallet.isActive,
        createdAt: wallet.createdAt
      }
    });
  } catch (error) {
    console.error('Error al obtener wallet del tesorero:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/wallets/:walletId/transactions - Obtener transacciones de una wallet
router.get('/:walletId/transactions', async (req, res) => {
  try {
    const walletId = parseInt(req.params.walletId);
    
    if (isNaN(walletId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de wallet inválido'
      });
    }

    const transactions = await walletService.getWalletTransactions(walletId);
    
    return res.json({
      success: true,
      data: transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/wallets/validate - Validar una wallet URL
router.post('/validate', async (req, res) => {
  try {
    const { walletUrl } = req.body;

    if (!walletUrl) {
      return res.status(400).json({
        success: false,
        error: 'walletUrl es requerido'
      });
    }

    const isValid = await walletService.validateWalletUrl(walletUrl);
    const walletInfo = isValid ? await walletService.getWalletInfo(walletUrl) : null;

    return res.json({
      success: true,
      data: {
        isValid,
        walletInfo
      }
    });
  } catch (error) {
    console.error('Error al validar wallet:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/wallets/transaction/:transactionId/status - Verificar estado de transacción
router.get('/transaction/:transactionId/status', async (req, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId);
    
    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de transacción inválido'
      });
    }

    const status = await walletService.checkTransactionStatus(transactionId);
    
    return res.json(status);
  } catch (error) {
    console.error('Error al verificar estado de transacción:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// PUT /api/wallets/:walletId/balance - Actualizar balance de wallet (solo para testing)
router.put('/:walletId/balance', async (req, res) => {
  try {
    const walletId = parseInt(req.params.walletId);
    const { amount } = req.body;
    
    if (isNaN(walletId) || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'ID de wallet y amount válidos son requeridos'
      });
    }

    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Operación no permitida en producción'
      });
    }

    await walletService.updateWalletBalance(walletId, amount);
    
    const updatedWallet = await Wallet.findByPk(walletId);
    
    return res.json({
      success: true,
      data: updatedWallet,
      message: 'Balance actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;