import express from 'express';
import bcrypt from 'bcrypt';
import { Usuario } from '../models/index.js';

const router = express.Router();

// POST /api/auth/login - Autenticar usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario desactivado. Contacte al administrador.'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Login exitoso - generar token simple (en producción usar JWT)
    const token = `token-${usuario.id}-${Date.now()}`;

    // Excluir password de la respuesta
    const userResponse = usuario.toJSON();
    delete userResponse.password;

    return res.json({
      success: true,
      data: {
        user: userResponse,
        token: token
      },
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/auth/logout - Cerrar sesión (simple)
router.post('/logout', async (_req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// GET /api/auth/me - Obtener información del usuario actual (requiere token)
router.get('/me', async (_req, res) => {
  try {
    // En una implementación completa, aquí validaríamos el JWT token
    // Por ahora, devolvemos un mensaje básico
    res.json({
      success: true,
      message: 'Endpoint para obtener información del usuario autenticado',
      note: 'Implementar validación de JWT en producción'
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

export default router;