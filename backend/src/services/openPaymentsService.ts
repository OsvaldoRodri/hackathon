// OpenPayments Service for handling wallet transactions
import { createAuthenticatedClient } from '@interledger/open-payments';

export interface OpenPaymentsConfig {
  authServerUrl: string;
  walletAddressServerUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface WalletInfo {
  id: string;
  publicName?: string;
  assetCode: string;
  assetScale: number;
  authServer: string;
  resourceServer: string;
}

export interface PaymentRequest {
  walletAddress: string;
  amount: string;
  assetCode: string;
  assetScale: number;
  description?: string | undefined;
}

export interface PaymentResponse {
  id: string;
  walletAddress: string;
  incomingAmount?: {
    value: string;
    assetCode: string;
    assetScale: number;
  };
  receivedAmount?: {
    value: string;
    assetCode: string;
    assetScale: number;
  };
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export class OpenPaymentsService {
  private config: OpenPaymentsConfig;
  private client: any;

  constructor(config: OpenPaymentsConfig) {
    this.config = config;
    this.client = null;
    
    // Solo inicializar el cliente si tenemos las credenciales necesarias
    const privateKey = process.env.OPENPAYMENTS_PRIVATE_KEY;
    const keyId = process.env.OPENPAYMENTS_KEY_ID;
    
    if (privateKey && keyId && privateKey !== '' && keyId !== '') {
      try {
        this.client = createAuthenticatedClient({
          walletAddressUrl: config.walletAddressServerUrl,
          keyId: keyId,
          privateKey: privateKey,
        });
        console.log('[OpenPayments] Client initialized successfully');
      } catch (error) {
        console.error('[OpenPayments] Error initializing client:', error);
        this.client = null;
      }
    } else {
      console.warn('[OpenPayments] Missing credentials - client not initialized');
      console.warn('Please set OPENPAYMENTS_PRIVATE_KEY and OPENPAYMENTS_KEY_ID environment variables');
    }
  }

  /**
   * Obtiene información de una wallet address
   */
  async getWalletInfo(walletAddress: string): Promise<WalletInfo | null> {
    if (!this.client) {
      throw new Error('OpenPayments client not initialized. Please configure credentials.');
    }
    
    try {
      const walletAddressInfo = await this.client.walletAddress.get({
        url: walletAddress
      });

      if (!walletAddressInfo) {
        throw new Error('Wallet address not found');
      }

      return {
        id: walletAddressInfo.id,
        publicName: walletAddressInfo.publicName,
        assetCode: walletAddressInfo.assetCode,
        assetScale: walletAddressInfo.assetScale,
        authServer: walletAddressInfo.authServer,
        resourceServer: walletAddressInfo.resourceServer,
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return null;
    }
  }

  /**
   * Crea una solicitud de pago entrante (incoming payment)
   */
  async createIncomingPayment(request: PaymentRequest): Promise<PaymentResponse | null> {
    try {
      // Primero obtenemos la información de la wallet
      const walletInfo = await this.getWalletInfo(request.walletAddress);
      if (!walletInfo) {
        throw new Error('Invalid wallet address');
      }

      // Crear el incoming payment
      const incomingPayment = await this.client.incomingPayment.create(
        {
          walletAddress: request.walletAddress,
          accessToken: process.env.OPENPAYMENTS_ACCESS_TOKEN || ''
        },
        {
          walletAddress: request.walletAddress,
          incomingAmount: {
            value: request.amount,
            assetCode: request.assetCode,
            assetScale: request.assetScale,
          },
          description: request.description || 'Payment for utilities',
          metadata: {
            source: 'QuickPay',
            type: 'utility-payment'
          }
        }
      );

      return {
        id: incomingPayment.id,
        walletAddress: incomingPayment.walletAddress,
        incomingAmount: incomingPayment.incomingAmount,
        receivedAmount: incomingPayment.receivedAmount,
        completed: incomingPayment.completed,
        createdAt: incomingPayment.createdAt,
        updatedAt: incomingPayment.updatedAt,
      };
    } catch (error) {
      console.error('Error creating incoming payment:', error);
      return null;
    }
  }

  /**
   * Realiza una cita (quote) para un pago saliente
   */
  async createQuote(senderWalletAddress: string, receiver: string, amount: string, assetCode: string, assetScale: number) {
    try {
      const quote = await this.client.quote.create(
        {
          walletAddress: senderWalletAddress,
          accessToken: process.env.OPENPAYMENTS_ACCESS_TOKEN || ''
        },
        {
          walletAddress: senderWalletAddress,
          receiver: receiver,
          method: 'ilp',
          debitAmount: {
            value: amount,
            assetCode: assetCode,
            assetScale: assetScale,
          }
        }
      );

      return quote;
    } catch (error) {
      console.error('Error creating quote:', error);
      return null;
    }
  }

  /**
   * Ejecuta un pago saliente
   */
  async createOutgoingPayment(senderWalletAddress: string, quoteId: string) {
    try {
      const outgoingPayment = await this.client.outgoingPayment.create(
        {
          walletAddress: senderWalletAddress,
          accessToken: process.env.OPENPAYMENTS_ACCESS_TOKEN || ''
        },
        {
          walletAddress: senderWalletAddress,
          quoteId: quoteId,
          metadata: {
            source: 'QuickPay',
            type: 'utility-payment'
          }
        }
      );

      return outgoingPayment;
    } catch (error) {
      console.error('Error creating outgoing payment:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado de un incoming payment
   */
  async getIncomingPaymentStatus(paymentId: string, _walletAddress: string) {
    try {
      const payment = await this.client.incomingPayment.get({
        url: paymentId,
        accessToken: process.env.OPENPAYMENTS_ACCESS_TOKEN || ''
      });

      return payment;
    } catch (error) {
      console.error('Error getting incoming payment status:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado de un outgoing payment
   */
  async getOutgoingPaymentStatus(paymentId: string, _walletAddress: string) {
    try {
      const payment = await this.client.outgoingPayment.get({
        url: paymentId,
        accessToken: process.env.OPENPAYMENTS_ACCESS_TOKEN || ''
      });

      return payment;
    } catch (error) {
      console.error('Error getting outgoing payment status:', error);
      return null;
    }
  }

  /**
   * Procesa un pago completo desde sender a receiver
   */
  async processPayment(
    senderWalletAddress: string,
    receiverWalletAddress: string,
    amount: string,
    assetCode: string = 'USD',
    assetScale: number = 2,
    description?: string
  ) {
    try {
      console.log(`Starting payment process: ${amount} ${assetCode} from ${senderWalletAddress} to ${receiverWalletAddress}`);

      // 1. Crear incoming payment en la wallet del receptor
      const incomingPayment = await this.createIncomingPayment({
        walletAddress: receiverWalletAddress,
        amount: amount,
        assetCode: assetCode,
        assetScale: assetScale,
        description: description
      });

      if (!incomingPayment) {
        throw new Error('Failed to create incoming payment');
      }

      console.log('Incoming payment created:', incomingPayment.id);

      // 2. Crear quote para el pago saliente
      const quote = await this.createQuote(
        senderWalletAddress,
        incomingPayment.id,
        amount,
        assetCode,
        assetScale
      );

      if (!quote) {
        throw new Error('Failed to create quote');
      }

      console.log('Quote created:', quote.id);

      // 3. Ejecutar el pago saliente
      const outgoingPayment = await this.createOutgoingPayment(
        senderWalletAddress,
        quote.id
      );

      if (!outgoingPayment) {
        throw new Error('Failed to create outgoing payment');
      }

      console.log('Outgoing payment created:', outgoingPayment.id);

      return {
        success: true,
        incomingPaymentId: incomingPayment.id,
        outgoingPaymentId: outgoingPayment.id,
        quoteId: quote.id,
        amount: amount,
        assetCode: assetCode,
        status: 'processing'
      };

    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'failed'
      };
    }
  }

  /**
   * Verifica si una wallet address es válida
   */
  async validateWalletAddress(walletAddress: string): Promise<boolean> {
    const walletInfo = await this.getWalletInfo(walletAddress);
    return walletInfo !== null;
  }
}

// Instancia singleton del servicio
const openPaymentsConfig: OpenPaymentsConfig = {
  authServerUrl: process.env.OPENPAYMENTS_AUTH_SERVER_URL || 'https://auth.wallet.example',
  walletAddressServerUrl: process.env.OPENPAYMENTS_WALLET_ADDRESS_SERVER_URL || 'https://wallet.example',
  clientId: process.env.OPENPAYMENTS_CLIENT_ID || 'quickpay-client',
  clientSecret: process.env.OPENPAYMENTS_CLIENT_SECRET || 'quickpay-secret',
};

// Export a function to create the service when needed
export const createOpenPaymentsService = () => {
  return new OpenPaymentsService(openPaymentsConfig);
};