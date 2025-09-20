# Integración con OpenPayments

Esta documentación explica cómo hemos integrado OpenPayments en QuickPay para gestionar los pagos de servicios de luz y agua.

## 🎯 Características Implementadas

### 1. **Sistema de Wallets**
- **Gestión de Wallets**: Cada usuario puede configurar su wallet OpenPayments
- **Validación de Wallets**: Verificación automática de URLs de wallet usando la API de OpenPayments
- **Balance Tracking**: Seguimiento local de balances estimados

### 2. **Pagos con OpenPayments**
- **Procesamiento Real**: Pagos procesados usando la API de OpenPayments
- **Flujo Completo**: Incoming payments, quotes y outgoing payments
- **Tracking de Transacciones**: Seguimiento del estado de cada transacción

### 3. **Actualización de Wallets**
- **Cliente**: Su wallet se debita automáticamente al realizar un pago
- **Tesorero**: La wallet del tesorero recibe los fondos de todos los pagos
- **Sincronización**: Los balances se actualizan en tiempo real

## 🔧 Componentes Técnicos

### Backend
1. **Modelos**:
   - `Wallet.ts`: Modelo de wallet de usuario
   - `PaymentTransaction.ts`: Modelo de transacciones de pago

2. **Servicios**:
   - `openPaymentsService.ts`: Integración directa con OpenPayments API
   - `walletService.ts`: Lógica de negocio para wallets y pagos

3. **Rutas**:
   - `/api/wallets/*`: Gestión de wallets
   - `/api/recibos/:id/pagar`: Pago de recibos con OpenPayments

### Frontend
1. **Componentes Actualizados**:
   - `payments.tsx`: Muestra información de wallet y permite pagos
   - `procespayments.tsx`: Interfaz mejorada con datos de wallet

2. **Servicios**:
   - `api.ts`: Métodos para interactuar con las APIs de wallet

## 🚀 Flujo de Pago

### 1. Configuración Inicial
```typescript
// Usuario configura su wallet
const wallet = await apiService.createWallet({
  userId: currentUser.id,
  walletUrl: 'https://wallet.example/user123',
  publicKey: 'generated-key'
});
```

### 2. Procesamiento de Pago
```typescript
// Pago de recibo
const payment = await apiService.pagarRecibo(reciboId, {
  userId: currentUser.id,
  walletCode: userWallet.walletUrl
});
```

### 3. Flujo OpenPayments
1. **Incoming Payment**: Se crea en la wallet del tesorero
2. **Quote**: Se genera para calcular costos
3. **Outgoing Payment**: Se ejecuta desde la wallet del cliente
4. **Actualización**: Se actualizan balances locales

## 📊 Nuevas APIs

### Wallets
- `GET /api/wallets/user/:userId` - Obtener wallet del usuario
- `POST /api/wallets` - Crear nueva wallet
- `GET /api/wallets/treasurer` - Obtener wallet del tesorero
- `GET /api/wallets/:walletId/transactions` - Historial de transacciones
- `POST /api/wallets/validate` - Validar URL de wallet

### Pagos
- `PUT /api/recibos/:id/pagar` - Pagar recibo (ahora con OpenPayments)

## ⚙️ Configuración

### Variables de Entorno
```bash
# OpenPayments Configuration
OPENPAYMENTS_AUTH_SERVER_URL=https://auth.wallet.example
OPENPAYMENTS_WALLET_ADDRESS_SERVER_URL=https://wallet.example
OPENPAYMENTS_CLIENT_ID=quickpay-client
OPENPAYMENTS_CLIENT_SECRET=your-secret
OPENPAYMENTS_KEY_ID=your-key-id
OPENPAYMENTS_PRIVATE_KEY=your-private-key
OPENPAYMENTS_ACCESS_TOKEN=your-access-token
```

### Dependencias Nuevas
```bash
npm install @interledger/open-payments
```

## 🔒 Seguridad

1. **Validación de Wallets**: Todas las URLs de wallet se validan antes de usar
2. **Verificación de Ownership**: Solo el propietario puede usar su wallet
3. **Transacciones Seguras**: Uso de claves privadas y access tokens
4. **Tracking Completo**: Registro de todas las transacciones

## 💡 Características de UI

### Página de Pagos
- **Información de Wallet**: Muestra balance y estado de la wallet
- **Configuración Fácil**: Botón para configurar wallet si no existe
- **Validación en Tiempo Real**: Verificación de wallet URLs

### Procesamiento de Pagos
- **Auto-fill**: La wallet del usuario se llena automáticamente
- **Información Detallada**: Muestra balance disponible
- **Feedback Visual**: Estados claros del procesamiento

## 🧪 Testing

### Wallets de Prueba
Para testing, puedes usar estas URLs de ejemplo:
```
Tesorero: https://wallet.example/treasurer
Usuario: https://wallet.example/user123
```

### Comandos de Testing
```bash
# Iniciar backend
cd backend && npm run dev

# Iniciar frontend
cd frontend && npm run dev
```

## 🔄 Estado de las Wallets

### Cliente
- **Antes del Pago**: Balance disponible se muestra
- **Durante el Pago**: Estado "procesando" con OpenPayments
- **Después del Pago**: Balance actualizado automáticamente

### Tesorero
- **Recepción Automática**: Todos los pagos van a la wallet del tesorero
- **Balance Consolidado**: Suma de todos los pagos recibidos
- **Historial Completo**: Track de todas las transacciones entrantes

## 📈 Próximos Pasos

1. **Autenticación OAuth**: Implementar flujo OAuth con OpenPayments
2. **Webhooks**: Escuchar eventos de OpenPayments para actualizaciones en tiempo real
3. **Multi-Currency**: Soporte para múltiples monedas
4. **Reportes Avanzados**: Dashboard de tesorería con métricas de OpenPayments

## 🐛 Troubleshooting

### Errores Comunes
1. **"Wallet URL no válida"**: Verificar que la URL sea accesible desde OpenPayments
2. **"Usuario no tiene wallet"**: El usuario debe configurar su wallet primero
3. **"Error de conexión OpenPayments"**: Verificar configuración de credenciales

### Logs
Todos los errores se registran en la consola del servidor con prefijo `[OpenPayments]`.