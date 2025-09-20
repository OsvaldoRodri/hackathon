// API Service Layer for Frontend-Backend Communication

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  curp: string;
  rol: 'dueno' | 'admin' | 'tesorero';
  activo: boolean;
  fechaRegistro: string;
  propiedades?: Domicilio[];
}

export interface Domicilio {
  id: number;
  calle: string;
  numero: string;
  colonia: string;
  municipio: string;
  estado: string;
  tipo: 'apartamento' | 'casa' | 'local' | 'otro';
  duenoId: number;
  propietario?: Usuario;
  recibos?: Recibo[];
}

export interface Recibo {
  id: number;
  numero: string;
  concepto: 'luz' | 'agua';
  monto: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: 'pendiente' | 'pagado' | 'vencido';
  domicilioId: number;
  domicilio?: Domicilio;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  filtro?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  curp: string;
  rol?: 'dueno' | 'admin' | 'tesorero';
}

export interface ReportesIngresos {
  totalIngresos: number;
  cantidadRecibos: number;
  detalles: Recibo[];
}

export interface Estadisticas {
  totalUsuarios: number;
  totalDuenos: number;
  totalAdmins: number;
  totalTesoreros: number;
  totalDomicilios: number;
  totalRecibos: number;
  recibosPendientes: number;
  timestamp: string;
}

// Interfaces para Wallets y OpenPayments
export interface Wallet {
  id: number;
  userId: number;
  walletUrl: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  user?: Usuario;
}

export interface PaymentTransaction {
  id: number;
  reciboId: number;
  senderWalletId: number;
  receiverWalletId: number;
  amount: number;
  paymentPointer: string;
  openPaymentsTransactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  senderWallet?: Wallet;
  receiverWallet?: Wallet;
}

export interface CreateWalletRequest {
  userId: number;
  walletUrl: string;
  publicKey: string;
}

export interface ProcessPaymentRequest {
  userId: number;
  walletCode: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3000/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization token if available
    const token = localStorage.getItem('userToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Try to parse JSON, but handle cases where response is not JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        // Create an error object with response details for better error handling
        const error = new Error(data.error || `HTTP error! status: ${response.status}`);
        (error as any).response = {
          status: response.status,
          statusText: response.statusText,
          data: data
        };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods (Note: Backend doesn't have auth endpoints yet, this is prepared for future implementation)
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: Usuario; token: string }>> {
    // For now, simulate login with existing users from backend
    try {
      // Get all users to find matching credentials
      const users = await this.getUsuarios();
      const user = users.data.find(u => u.email === credentials.email);
      
      if (user) {
        // Simulate successful login
        const token = `token-${user.id}-${Date.now()}`;
        localStorage.setItem('userToken', token);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole', user.rol);
        localStorage.setItem('userId', user.id.toString());
        
        return {
          success: true,
          data: { user, token }
        };
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      throw new Error('Error al iniciar sesión');
    }
  }

  async signup(userData: SignUpRequest): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Usuario methods
  async getUsuarios(rol?: string): Promise<ApiResponse<Usuario[]>> {
    const query = rol ? `?rol=${rol}` : '';
    return this.request<Usuario[]>(`/usuarios${query}`);
  }

  async getUsuario(id: number): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/usuarios/${id}`);
  }

  async getDuenos(): Promise<ApiResponse<Usuario[]>> {
    return this.request<Usuario[]>('/usuarios/duenos');
  }

  async getAdmins(): Promise<ApiResponse<Usuario[]>> {
    return this.request<Usuario[]>('/usuarios/admins');
  }

  async getTesoreros(): Promise<ApiResponse<Usuario[]>> {
    return this.request<Usuario[]>('/usuarios/tesoreros');
  }

  async createUsuario(userData: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUsuario(id: number, userData: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUsuario(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUsuarioStatus(id: number): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/usuarios/${id}/toggle-status`, {
      method: 'PUT',
    });
  }

  // Domicilio methods
  async getDomicilios(): Promise<ApiResponse<Domicilio[]>> {
    return this.request<Domicilio[]>('/domicilios');
  }

  async getDomicilio(id: number): Promise<ApiResponse<Domicilio>> {
    return this.request<Domicilio>(`/domicilios/${id}`);
  }

  async createDomicilio(domicilioData: Partial<Domicilio>): Promise<ApiResponse<Domicilio>> {
    return this.request<Domicilio>('/domicilios', {
      method: 'POST',
      body: JSON.stringify(domicilioData),
    });
  }

  async getDomicilioRecibos(id: number): Promise<ApiResponse<Recibo[]>> {
    return this.request<Recibo[]>(`/domicilios/${id}/recibos`);
  }

  // Recibo methods
  async getRecibos(): Promise<ApiResponse<Recibo[]>> {
    return this.request<Recibo[]>('/recibos');
  }

  async getRecibosPendientes(): Promise<ApiResponse<Recibo[]>> {
    return this.request<Recibo[]>('/recibos/pendientes');
  }

  async createRecibo(reciboData: Partial<Recibo>): Promise<ApiResponse<Recibo>> {
    return this.request<Recibo>('/recibos', {
      method: 'POST',
      body: JSON.stringify(reciboData),
    });
  }

  async pagarRecibo(id: number, paymentData?: ProcessPaymentRequest): Promise<ApiResponse<Recibo>> {
    return this.request<Recibo>(`/recibos/${id}/pagar`, {
      method: 'PUT',
      body: JSON.stringify(paymentData || {}),
    });
  }

  // Reportes methods
  async getReportesIngresos(): Promise<ApiResponse<ReportesIngresos>> {
    return this.request<ReportesIngresos>('/reportes/ingresos');
  }

  async getEstadisticas(): Promise<ApiResponse<Estadisticas>> {
    return this.request<Estadisticas>('/reportes/estadisticas');
  }

  // Wallet methods
  async getUserWallet(userId: number): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>(`/wallets/user/${userId}`);
  }

  async createWallet(walletData: CreateWalletRequest): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>('/wallets', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  }

  async getTreasurerWallet(): Promise<ApiResponse<Wallet>> {
    return this.request<Wallet>('/wallets/treasurer');
  }

  async getWalletTransactions(walletId: number): Promise<ApiResponse<PaymentTransaction[]>> {
    return this.request<PaymentTransaction[]>(`/wallets/${walletId}/transactions`);
  }

  async validateWalletUrl(walletUrl: string): Promise<ApiResponse<{ isValid: boolean; walletInfo?: any }>> {
    return this.request<{ isValid: boolean; walletInfo?: any }>('/wallets/validate', {
      method: 'POST',
      body: JSON.stringify({ walletUrl }),
    });
  }

  async getTransactionStatus(transactionId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/wallets/transaction/${transactionId}/status`);
  }

  // Utility methods
  logout(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('userToken');
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getCurrentUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
  }

  getCurrentUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;