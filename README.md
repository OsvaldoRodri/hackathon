# Fase 2 – Prototipado -> Version en español

## 2) Scripts de base de datos (tu script)
**Motor:** MySQL (InnoDB).  
**Juego de caracteres:** `utf8mb4` y colación `utf8mb4_0900_ai_ci`.  
**Reset seguro:** desactiva/activa `FOREIGN_KEY_CHECKS` y elimina `recibos`, `domicilios`, `usuarios`.

**Tablas y reglas:**
- **usuarios**
  - Campos clave: `id`, `email` (UNIQUE), `curp` (UNIQUE), `rol` (`dueno|admin|tesorero`), `activo`, timestamps (`createdAt`, `updatedAt`, `fechaRegistro`).
  - Propósito: identidad y control de acceso por rol.
- **domicilios**
  - Relación: `duenoId → usuarios(id)` con **FK** `ON UPDATE CASCADE ON DELETE RESTRICT`.
  - Campos: dirección completa, `tipo` (`apartamento|casa|local`), timestamps.
  - Propósito: unidad catastral a la que se asocian los recibos.
- **recibos**
  - Campos clave: `numero` (UNIQUE), `concepto` (`luz|agua`), `monto`, `fechaVencimiento`, `fechaPago` (nullable), `estado` (`pendiente|pagado|vencido`), `domicilioId`.
  - Relación: `domicilioId → domicilios(id)` con **FK** `ON UPDATE CASCADE ON DELETE RESTRICT`.
  - Propósito: documento a cobrar y su ciclo de vida.
- **Datos de ejemplo (seed)**
  - 3 usuarios (dueno/admin/tesorero).
  - 3 domicilios del usuario 1.
  - 3 recibos (pendiente/pagado/pendiente) con luz/agua.

> **Anexo técnico**: El script crea `condominios_db`, define claves únicas (email, curp, número de recibo), enums para rol/concepto/estado y añade índices por FK; esto soporta autenticación básica, gestión de domicilios y estado de cobros.
>
### > SCRIPT DE SQL:
-- ========= DB & RESET =========
CREATE DATABASE IF NOT EXISTS condominios_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE condominios_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS recibos;
DROP TABLE IF EXISTS domicilios;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ========= TABLA: usuarios =========
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(120)        NOT NULL,
  apellido       VARCHAR(120)        NOT NULL,
  email          VARCHAR(255)        NOT NULL,
  password       VARCHAR(255)        NOT NULL,
  telefono       VARCHAR(50),
  curp           VARCHAR(18)         NOT NULL,
  rol            ENUM('dueno','admin','tesorero') NOT NULL DEFAULT 'dueno'
                   COMMENT 'dueno (propietario), admin (administrador), tesorero (finanzas)',
  activo         TINYINT(1)          NOT NULL DEFAULT 1
                   COMMENT '0 = inactivo, 1 = activo',
  fechaRegistro  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  UNIQUE KEY uq_usuarios_curp  (curp)
) ENGINE=InnoDB;

-- ========= TABLA: domicilios =========
CREATE TABLE domicilios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  calle      VARCHAR(160)  NOT NULL,
  numero     VARCHAR(30)   NOT NULL,
  colonia    VARCHAR(160)  NOT NULL,
  municipio  VARCHAR(160)  NOT NULL,
  estado     VARCHAR(160)  NOT NULL,
  tipo       ENUM('apartamento','casa','local') NOT NULL,
  duenoId    INT           NOT NULL,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_domicilios_dueno (duenoId),
  CONSTRAINT fk_domicilios_dueno
    FOREIGN KEY (duenoId) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ========= TABLA: recibos =========
CREATE TABLE recibos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  numero            VARCHAR(50)   NOT NULL,
  concepto          ENUM('luz','agua') NOT NULL,
  monto             DECIMAL(10,2) NOT NULL,
  fechaVencimiento  DATETIME      NOT NULL,
  fechaPago         DATETIME      NULL,
  estado            ENUM('pendiente','pagado','vencido') NOT NULL DEFAULT 'pendiente',
  domicilioId       INT           NULL,
  createdAt         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_recibos_numero (numero),
  KEY ix_recibos_domicilio (domicilioId),
  CONSTRAINT fk_recibos_domicilio
    FOREIGN KEY (domicilioId) REFERENCES domicilios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;




INSERT INTO usuarios (nombre,apellido,email,password,telefono,curp,rol,activo)
VALUES
('Juan','Pérez','juan@test.com','hash1','555-1234','PEJJ800101HAGSNS09','dueno',1),
('María','González','maria@test.com','hash2','555-5678','GOZM900202MDFLNR08','admin',1),
('Carlos','Rodríguez','carlos@test.com','hash3','555-9012','RODC850303HMCNRR07','tesorero',1);

INSERT INTO domicilios (calle,numero,colonia,municipio,estado,tipo,duenoId)
VALUES
('Av. Centro','101','Las Flores','Nochistlán','Zacatecas','apartamento',1),
('Av. Centro','102','Las Flores','Nochistlán','Zacatecas','apartamento',1),
('Calle Benito Juárez','12-B','Centro','Aguascalientes','Aguascalientes','casa',1);

INSERT INTO recibos (numero,concepto,monto,fechaVencimiento,estado,domicilioId)
VALUES
('REC-001','luz',450.00,'2024-02-15','pendiente',1),
('REC-002','agua',280.50,'2024-02-10','pagado',1),
('REC-003','luz',520.75,'2024-03-15','pendiente',2);


## 3) Documentación técnica
- **Arquitectura**: cliente (React) ↔ servidor (Express) ↔ MySQL.  
- **Flujos principales**:
  1. **Emisión/listado de recibos** por domicilio.
  2. **Cambio de estado** de recibo (`pendiente → pagado`), registrando `fechaPago`.
  3. **Panel por rol**:
     - *Dueño*: ve y paga sus recibos.
     - *Tesorero*: ve morosidad por domicilio, confirma pagos globales.
     - *Admin*: alta/baja/edición de usuarios y domicilios.
- **Integración de pagos (planeada)**: endpoints para crear invoice y confirmar pago (Open Payments/PSP). Al confirmar, el backend actualiza `recibos.estado` y `fechaPago`.

## 4) Manual de usuario (versión inicial)
- **Dueño (propietario)**
  1. Inicia sesión con email y contraseña.
  2. Revisa domicilios y recibos pendientes.
  3. Elige un recibo → “Pagar” → recibe comprobante y cambia a “pagado”.
- **Tesorero**
  1. Accede al panel de morosidad y vencidos.
  2. Filtra por colonia/fecha y descarga reporte.
  3. Confirma pagos recibidos y concilia contra el proveedor.
- **Admin**
  1. Da de alta usuarios (definir rol) y domicilios (asignar dueño).
  2. Corrige datos y gestiona accesos (activar/desactivar).

## 5) Buenas prácticas de seguridad
- **Autenticación**: hash de contraseñas (bcrypt), sesiones/JWT con expiración corta.
- **Autorización por rol**: middlewares para `dueno/admin/tesorero`.
- **Transporte**: HTTPS/TLS.
- **Validaciones**: sanitización de entradas, validación de enums y montos.
- **BD**: mínimos privilegios por usuario de conexión; copias de seguridad.
- **Registros**: logs de acceso/cambios de estado de recibos.
- **(Cuando se integre PSP/Open Payments)**: verificación de firmas de webhooks y protección anti-replay.

 
  - Login → dashboard por rol.  
  - Lista de recibos por domicilio.  
  - Cambio de estado de un recibo a “pagado”.  
- Colección Postman/Insomnia con endpoints CRUD y pago simulado.






# Phase 2 – Prototyping -> English Version

## 2) Database Scripts (your script)
**Engine:** MySQL (InnoDB).  
**Character set:** `utf8mb4` and collation `utf8mb4_0900_ai_ci`.  
**Safe reset:** disables/enables `FOREIGN_KEY_CHECKS` and drops `recibos`, `domicilios`, `usuarios`.

**Tables and rules:**
- **usuarios**
  - Key fields: `id`, `email` (UNIQUE), `curp` (UNIQUE), `rol` (`dueno|admin|tesorero`), `activo`, timestamps (`createdAt`, `updatedAt`, `fechaRegistro`).
  - Purpose: identity and role-based access control.
- **domicilios**
  - Relation: `duenoId → usuarios(id)` with **FK** `ON UPDATE CASCADE ON DELETE RESTRICT`.
  - Fields: full address, `tipo` (`apartamento|casa|local`), timestamps.
  - Purpose: cadastral unit associated with receipts.
- **recibos**
  - Key fields: `numero` (UNIQUE), `concepto` (`luz|agua`), `monto`, `fechaVencimiento`, `fechaPago` (nullable), `estado` (`pendiente|pagado|vencido`), `domicilioId`.
  - Relation: `domicilioId → domicilios(id)` with **FK** `ON UPDATE CASCADE ON DELETE RESTRICT`.
  - Purpose: billing document and its lifecycle.
- **Sample data (seed)**
  - 3 users (dueno/admin/tesorero).
  - 3 domicilios belonging to user 1.
  - 3 receipts (pending/paid/pending) for electricity/water.

> **Technical Annex**: The script creates `condominios_db`, defines unique keys (email, curp, receipt number), enums for role/concept/status, and adds FK indexes; this supports basic authentication, property management, and receipt state tracking.
>
### > SQL SCRIPT:
-- ========= DB & RESET =========
CREATE DATABASE IF NOT EXISTS condominios_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE condominios_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS recibos;
DROP TABLE IF EXISTS domicilios;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ========= TABLE: usuarios =========
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(120)        NOT NULL,
  apellido       VARCHAR(120)        NOT NULL,
  email          VARCHAR(255)        NOT NULL,
  password       VARCHAR(255)        NOT NULL,
  telefono       VARCHAR(50),
  curp           VARCHAR(18)         NOT NULL,
  rol            ENUM('dueno','admin','tesorero') NOT NULL DEFAULT 'dueno'
                   COMMENT 'dueno (owner), admin (administrator), tesorero (finance)',
  activo         TINYINT(1)          NOT NULL DEFAULT 1
                   COMMENT '0 = inactive, 1 = active',
  fechaRegistro  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email),
  UNIQUE KEY uq_usuarios_curp  (curp)
) ENGINE=InnoDB;

-- ========= TABLE: domicilios =========
CREATE TABLE domicilios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  calle      VARCHAR(160)  NOT NULL,
  numero     VARCHAR(30)   NOT NULL,
  colonia    VARCHAR(160)  NOT NULL,
  municipio  VARCHAR(160)  NOT NULL,
  estado     VARCHAR(160)  NOT NULL,
  tipo       ENUM('apartamento','casa','local') NOT NULL,
  duenoId    INT           NOT NULL,
  createdAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_domicilios_dueno (duenoId),
  CONSTRAINT fk_domicilios_dueno
    FOREIGN KEY (duenoId) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ========= TABLE: recibos =========
CREATE TABLE recibos (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  numero            VARCHAR(50)   NOT NULL,
  concepto          ENUM('luz','agua') NOT NULL,
  monto             DECIMAL(10,2) NOT NULL,
  fechaVencimiento  DATETIME      NOT NULL,
  fechaPago         DATETIME      NULL,
  estado            ENUM('pendiente','pagado','vencido') NOT NULL DEFAULT 'pendiente',
  domicilioId       INT           NULL,
  createdAt         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_recibos_numero (numero),
  KEY ix_recibos_domicilio (domicilioId),
  CONSTRAINT fk_recibos_domicilio
    FOREIGN KEY (domicilioId) REFERENCES domicilios(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;




INSERT INTO usuarios (nombre,apellido,email,password,telefono,curp,rol,activo)
VALUES
('Juan','Pérez','juan@test.com','hash1','555-1234','PEJJ800101HAGSNS09','dueno',1),
('María','González','maria@test.com','hash2','555-5678','GOZM900202MDFLNR08','admin',1),
('Carlos','Rodríguez','carlos@test.com','hash3','555-9012','RODC850303HMCNRR07','tesorero',1);

INSERT INTO domicilios (calle,numero,colonia,municipio,estado,tipo,duenoId)
VALUES
('Av. Centro','101','Las Flores','Nochistlán','Zacatecas','apartamento',1),
('Av. Centro','102','Las Flores','Nochistlán','Zacatecas','apartamento',1),
('Calle Benito Juárez','12-B','Centro','Aguascalientes','Aguascalientes','casa',1);

INSERT INTO recibos (numero,concepto,monto,fechaVencimiento,estado,domicilioId)
VALUES
('REC-001','luz',450.00,'2024-02-15','pendiente',1),
('REC-002','agua',280.50,'2024-02-10','pagado',1),
('REC-003','luz',520.75,'2024-03-15','pendiente',2);


## 3) Technical Documentation
- **Architecture**: client (React) ↔ server (Express) ↔ MySQL.  
- **Main flows**:
  1. **Issuance/listing of receipts** by address.
  2. **Status change** of receipt (`pending → paid`), recording `fechaPago`.
  3. **Role-based panel**:
     - *Owner*: views and pays receipts.
     - *Treasurer*: views delinquency by property, confirms global payments.
     - *Admin*: creates/edits/deletes users and properties.
- **Payment integration (planned)**: endpoints to create invoices and confirm payment (Open Payments/PSP). On confirmation, the backend updates `recibos.estado` and `fechaPago`.

## 4) User Manual (initial version)
- **Owner**
  1. Log in with email and password.
  2. Review properties and pending receipts.
  3. Select a receipt → “Pay” → get confirmation and status changes to “paid”.
- **Treasurer**
  1. Access the delinquency and overdue panel.
  2. Filter by neighborhood/date and download reports.
  3. Confirm received payments and reconcile with the provider.
- **Admin**
  1. Register users (define role) and properties (assign owner).
  2. Correct data and manage access (activate/deactivate).

## 5) Security Best Practices
- **Authentication**: password hashing (bcrypt), sessions/JWT with short expiration.
- **Role-based authorization**: middlewares for `dueno/admin/tesorero`.
- **Transport**: HTTPS/TLS.
- **Validations**: input sanitization, enums and amount validation.
- **Database**: minimum privileges per connection user; backups.
- **Logs**: access logs/receipt state change logs.
- **(When PSP/Open Payments is integrated)**: webhook signature verification and anti-replay protection.

 
  - Login → role-based dashboard.  
  - List of receipts by property.  
  - Change receipt state to “paid”.  
- Postman/Insomnia collection with CRUD endpoints and simulated payment.


