# Frontend-Backend Integration Guide

## 🚀 Integración Completada

Este documento describe la integración realizada entre el frontend (React + TypeScript) y el backend (Node.js + Express + Sequelize) del sistema de condominios QuickPays.

## 📋 Funcionalidades Implementadas

### ✅ 1. Capa de Servicios API
- **Archivo**: `frontend/src/services/api.ts`
- **Descripción**: Servicio centralizado para comunicación con el backend
- **Funcionalidades**:
  - Gestión de autenticación con tokens
  - Métodos para todas las operaciones CRUD de usuarios, domicilios y recibos
  - Manejo de errores centralizado
  - Tipos TypeScript para todas las interfaces

### ✅ 2. Sistema de Autenticación
- **Login**: `frontend/src/pages/login.tsx`
  - Conectado con endpoint `/api/usuarios`
  - Validación de credenciales real con datos del backend
  - Redirección automática según rol del usuario
  
- **Registro**: `frontend/src/pages/sign-up.tsx`
  - Creación de usuarios mediante `/api/usuarios`
  - Creación automática de domicilios asociados
  - Validaciones frontend y backend

### ✅ 3. Gestión de Usuarios (Admin)
- **Archivo**: `frontend/src/pages/admin-usuarios.tsx`
- **Conectado con**:
  - `GET /api/usuarios` - Listar usuarios
  - `GET /api/usuarios/:id` - Obtener usuario específico
  - `POST /api/usuarios` - Crear usuario
  - `PUT /api/usuarios/:id` - Actualizar usuario
  - `DELETE /api/usuarios/:id` - Eliminar usuario
  - `PUT /api/usuarios/:id/toggle-status` - Activar/desactivar

### ✅ 4. Gestión de Viviendas (Admin)
- **Archivo**: `frontend/src/pages/admin-viviendas.tsx`
- **Conectado con**:
  - `GET /api/domicilios` - Listar domicilios
  - `POST /api/domicilios` - Crear domicilio
  - `GET /api/usuarios/duenos` - Obtener dueños para asignación

### ✅ 5. Sistema de Pagos
- **Archivo**: `frontend/src/pages/payments.tsx`
- **Conectado con**:
  - `GET /api/usuarios/:id` - Datos del usuario con propiedades
  - `GET /api/domicilios/:id/recibos` - Recibos por domicilio
  - `PUT /api/recibos/:id/pagar` - Procesar pagos

## 🔧 Configuración Técnica

### Variables de Entorno
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api

# Backend (.env)
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
DB_NAME=condominios_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
```

### Estructura de Datos

#### Usuario (Backend Model)
```typescript
interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  cedula: string;
  rol: 'dueno' | 'admin' | 'tesorero';
  activo: boolean;
  fechaRegistro: Date;
  propiedades?: Domicilio[];
}
```

#### Domicilio (Backend Model)
```typescript
interface Domicilio {
  id: number;
  numero: string;
  bloque: string;
  area: number;
  tipo: 'apartamento' | 'casa' | 'local';
  duenoId: number;
  propietario?: Usuario;
  recibos?: Recibo[];
}
```

#### Recibo (Backend Model)
```typescript
interface Recibo {
  id: number;
  numero: string;
  concepto: string;
  monto: number;
  fechaVencimiento: Date;
  fechaPago: Date | null;
  estado: 'pendiente' | 'pagado' | 'vencido';
  domicilioId: number;
  domicilio?: Domicilio;
}
```

## 🧪 Testing y Validación

### 1. Probar Autenticación
```bash
# Iniciar backend
cd backend
npm run dev

# Iniciar frontend
cd frontend
npm run dev

# Navegar a http://localhost:5173
# Probar login con usuarios existentes en la base de datos
```

### 2. Usuarios de Prueba (Seed Data)
El sistema permite crear usuarios con diferentes roles:
- **Admin**: Acceso completo al panel de administración
- **Tesorero**: Acceso a gestión financiera
- **Dueño**: Acceso a pagos de sus propiedades

### 3. Flujos de Testing

#### Registro de Usuario
1. Ir a `/sign-up`
2. Llenar formulario completo (usuario + vivienda)
3. Verificar creación en base de datos
4. Probar login con nuevas credenciales

#### Gestión de Usuarios (Admin)
1. Login como admin/tesorero
2. Ir a `/admin-usuarios`
3. Crear, editar, activar/desactivar usuarios
4. Verificar cambios en tiempo real

#### Sistema de Pagos
1. Login como dueño
2. Ir a `/payments`
3. Verificar recibos de propiedades
4. Procesar pagos pendientes

## 🛠️ Endpoints API Disponibles

### Usuarios
- `GET /api/usuarios` - Todos los usuarios
- `GET /api/usuarios/duenos` - Solo dueños
- `GET /api/usuarios/admins` - Solo administradores
- `GET /api/usuarios/tesoreros` - Solo tesoreros
- `GET /api/usuarios/:id` - Usuario específico
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario
- `PUT /api/usuarios/:id/toggle-status` - Activar/desactivar

### Domicilios
- `GET /api/domicilios` - Todos los domicilios
- `GET /api/domicilios/:id` - Domicilio específico
- `POST /api/domicilios` - Crear domicilio
- `GET /api/domicilios/:id/recibos` - Recibos de un domicilio

### Recibos
- `GET /api/recibos` - Todos los recibos
- `GET /api/recibos/pendientes` - Solo pendientes
- `POST /api/recibos` - Crear recibo
- `PUT /api/recibos/:id/pagar` - Procesar pago

### Reportes
- `GET /api/reportes/ingresos` - Reporte de ingresos
- `GET /api/reportes/estadisticas` - Estadísticas generales

## 🔄 Estado de la Integración

### ✅ Completado
- [x] Capa de servicios API frontend
- [x] Sistema de autenticación completo
- [x] Gestión de usuarios con CRUD completo
- [x] Gestión de viviendas/domicilios
- [x] Sistema de pagos y recibos
- [x] Manejo de estados de carga y errores
- [x] Validaciones frontend y backend
- [x] Tipado TypeScript completo

### 🔄 En Desarrollo
- [ ] Autenticación con JWT tokens (actualmente simulada)
- [ ] Validación de permisos por rol
- [ ] Paginación para listas grandes
- [ ] Filtros avanzados en tablas
- [ ] Subida de archivos/documentos

### 🚀 Próximos Pasos
1. Implementar autenticación JWT real
2. Agregar middleware de autorización por roles
3. Implementar paginación en endpoints
4. Agregar tests unitarios y de integración
5. Optimizar rendimiento con React Query/SWR

## 📚 Documentación Adicional

- **Backend API**: Ver documentación en `/api` endpoint
- **Models**: Revisar `backend/src/models/index.ts`
- **Frontend Types**: Ver `frontend/src/services/api.ts`
- **Estilos**: CSS modules en `frontend/src/styles/`

## 🐛 Troubleshooting

### Error de CORS
Verificar que `ALLOWED_ORIGINS` en backend incluya `http://localhost:5173`

### Error de Base de Datos
Asegurar que MySQL esté corriendo y las credenciales sean correctas

### Error de Tipos TypeScript
Ejecutar `npm run type-check` en frontend para verificar tipos

### Error de Conexión API
Verificar que backend esté corriendo en puerto 3000 y que VITE_API_URL esté configurado correctamente