import { Usuario, Wallet, PaymentTransaction } from '../models/index.js';
import { createOpenPaymentsService } from './openPaymentsService.js';

export interface CreateWalletRequest {
  userId: number;
  walletUrl: string;
  publicKey: string;
}

export interface ProcessPaymentRequest {
  reciboId: number;
  senderUserId: number;
  receiverUserId: number;
  amount: number;
  description?: string;
}

export class WalletService {
  private openPaymentsService: any;
  
  constructor() {
    this.openPaymentsService = createOpenPaymentsService();
  }
  
  /**
   * Crea una nueva wallet para un usuario
   */
  async createWallet(request: CreateWalletRequest): Promise<Wallet | null> {
    try {
      // Verificar que el usuario existe
      const user = await Usuario.findByPk(request.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que la wallet URL es válida con OpenPayments
      const isValidWallet = await this.openPaymentsService.validateWalletAddress(request.walletUrl);
      if (!isValidWallet) {
        throw new Error('Wallet URL no válida o no accesible');
      }

      // Verificar que el usuario no tenga ya una wallet activa
      const existingWallet = await Wallet.findOne({
        where: { userId: request.userId, isActive: true }
      });

      if (existingWallet) {
        throw new Error('El usuario ya tiene una wallet activa');
      }

      // Crear la nueva wallet
      const wallet = await Wallet.create({
        userId: request.userId,
        walletUrl: request.walletUrl,
        publicKey: request.publicKey,
        balance: 0.00,
        isActive: true
      });

      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      return null;
    }
  }

  /**
   * Obtiene la wallet de un usuario
   */
  async getUserWallet(userId: number): Promise<Wallet | null> {
    try {
      const wallet = await Wallet.findOne({
        where: { userId, isActive: true },
        include: [{
          model: Usuario,
          as: 'user',
          attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
        }]
      });

      return wallet;
    } catch (error) {
      console.error('Error getting user wallet:', error);
      return null;
    }
  }

  /**
   * Obtiene la wallet del tesorero (para recibir pagos)
   */
  async getTreasurerWallet(): Promise<Wallet | null> {
    try {
      const treasurerUser = await Usuario.findOne({
        where: { rol: 'tesorero', activo: true }
      });

      if (!treasurerUser) {
        throw new Error('No se encontró un tesorero activo');
      }

      const wallet = await this.getUserWallet(treasurerUser.id);
      return wallet;
    } catch (error) {
      console.error('Error getting treasurer wallet:', error);
      return null;
    }
  }

  /**
   * Procesa un pago usando OpenPayments
   */
  async processPayment(request: ProcessPaymentRequest): Promise<any> {
    try {
      // 1. Obtener wallets del sender y receiver
      const senderWallet = await this.getUserWallet(request.senderUserId);
      const receiverWallet = await this.getUserWallet(request.receiverUserId);

      if (!senderWallet) {
        throw new Error('Wallet del pagador no encontrada');
      }

      if (!receiverWallet) {
        throw new Error('Wallet del receptor no encontrada');
      }

      // 2. Crear registro de transacción pendiente
      const transaction = await PaymentTransaction.create({
        reciboId: request.reciboId,
        senderWalletId: senderWallet.id,
        receiverWalletId: receiverWallet.id,
        amount: request.amount,
        paymentPointer: receiverWallet.walletUrl,
        status: 'pending'
      });

      // 3. Procesar pago con OpenPayments
      const paymentResult = await this.openPaymentsService.processPayment(
        senderWallet.walletUrl,
        receiverWallet.walletUrl,
        request.amount.toString(),
        'USD', // Por defecto USD, se puede parametrizar
        2, // Scale 2 para centavos
        request.description
      );

      // 4. Actualizar la transacción con el resultado
      if (paymentResult.success) {
        await transaction.update({
          openPaymentsTransactionId: paymentResult.outgoingPaymentId,
          status: 'completed',
          metadata: {
            incomingPaymentId: paymentResult.incomingPaymentId,
            quoteId: paymentResult.quoteId,
            processedAt: new Date().toISOString()
          }
        });

        // 5. Actualizar balances locales (estimados)
        await this.updateWalletBalance(senderWallet.id, -request.amount);
        await this.updateWalletBalance(receiverWallet.id, request.amount);

        return {
          success: true,
          transactionId: transaction.id,
          openPaymentsTransactionId: paymentResult.outgoingPaymentId,
          message: 'Pago procesado exitosamente'
        };
      } else {
        await transaction.update({
          status: 'failed',
          metadata: {
            error: paymentResult.error,
            failedAt: new Date().toISOString()
          }
        });

        return {
          success: false,
          error: paymentResult.error,
          message: 'Error al procesar el pago'
        };
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al procesar el pago'
      };
    }
  }

  /**
   * Actualiza el balance local de una wallet
   */
  async updateWalletBalance(walletId: number, amountChange: number): Promise<void> {
    try {
      const wallet = await Wallet.findByPk(walletId);
      if (!wallet) {
        throw new Error('Wallet no encontrada');
      }

      const newBalance = parseFloat(wallet.balance.toString()) + amountChange;
      await wallet.update({ balance: newBalance });
    } catch (error) {
      console.error('Error updating wallet balance:', error);
    }
  }

  /**
   * Obtiene el historial de transacciones de una wallet
   */
  async getWalletTransactions(walletId: number): Promise<PaymentTransaction[]> {
    try {
      const sentTransactions = await PaymentTransaction.findAll({
        where: { senderWalletId: walletId },
        include: [
          {
            model: Wallet,
            as: 'senderWallet',
            include: [{
              model: Usuario,
              as: 'user',
              attributes: ['nombre', 'apellido', 'email']
            }]
          },
          {
            model: Wallet,
            as: 'receiverWallet',
            include: [{
              model: Usuario,
              as: 'user',
              attributes: ['nombre', 'apellido', 'email']
            }]
          }
        ]
      });

      const receivedTransactions = await PaymentTransaction.findAll({
        where: { receiverWalletId: walletId },
        include: [
          {
            model: Wallet,
            as: 'senderWallet',
            include: [{
              model: Usuario,
              as: 'user',
              attributes: ['nombre', 'apellido', 'email']
            }]
          },
          {
            model: Wallet,
            as: 'receiverWallet',
            include: [{
              model: Usuario,
              as: 'user',
              attributes: ['nombre', 'apellido', 'email']
            }]
          }
        ]
      });

      // Combinar y ordenar todas las transacciones
      const allTransactions = [...sentTransactions, ...receivedTransactions];
      allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allTransactions;
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }

  /**
   * Valida una wallet URL usando OpenPayments
   */
  async validateWalletUrl(walletUrl: string): Promise<boolean> {
    return await this.openPaymentsService.validateWalletAddress(walletUrl);
  }

  /**
   * Obtiene información de una wallet desde OpenPayments
   */
  async getWalletInfo(walletUrl: string) {
    return await this.openPaymentsService.getWalletInfo(walletUrl);
  }

  /**
   * Verifica el estado de una transacción en OpenPayments
   */
  async checkTransactionStatus(transactionId: number): Promise<any> {
    try {
      const transaction = await PaymentTransaction.findByPk(transactionId, {
        include: [
          { model: Wallet, as: 'senderWallet' },
          { model: Wallet, as: 'receiverWallet' }
        ]
      });

      if (!transaction || !transaction.openPaymentsTransactionId) {
        return { success: false, error: 'Transacción no encontrada' };
      }

      // Obtener la wallet del sender
      const senderWallet = await Wallet.findByPk(transaction.senderWalletId);
      if (!senderWallet) {
        return { success: false, error: 'Wallet del pagador no encontrada' };
      }

      // Verificar estado en OpenPayments
      const paymentStatus = await this.openPaymentsService.getOutgoingPaymentStatus(
        transaction.openPaymentsTransactionId,
        senderWallet.walletUrl
      );

      if (paymentStatus) {
        // Actualizar estado local si es necesario
        if (paymentStatus.state !== transaction.status) {
          await transaction.update({
            status: paymentStatus.state === 'COMPLETED' ? 'completed' : 'failed',
            metadata: {
              ...transaction.metadata,
              lastChecked: new Date().toISOString(),
              openPaymentsState: paymentStatus.state
            }
          });
        }

        return {
          success: true,
          localStatus: transaction.status,
          openPaymentsStatus: paymentStatus.state,
          transaction: transaction
        };
      }

      return { success: false, error: 'No se pudo verificar el estado en OpenPayments' };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { success: false, error: 'Error al verificar estado de transacción' };
    }
  }
}

// Instancia singleton del servicio
export const walletService = new WalletService();