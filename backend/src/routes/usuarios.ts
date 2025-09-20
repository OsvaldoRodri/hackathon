import express from 'express';
import { Usuario, Domicilio } from '../models/index.js';
import { validateSchema, sanitizeInput } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/usuarios - Obtener todos los usuarios (con filtro opcional por rol)
router.get('/', async (req, res) => {
  try {
    const { rol } = req.query;
    
    const whereCondition: any = {};
    if (rol && ['dueno', 'admin', 'tesorero'].includes(rol as string)) {
      whereCondition.rol = rol;
    }
    
    const usuarios = await Usuario.findAll({ 
      where: whereCondition,
      include: [{
        model: Domicilio,
        as: 'propiedades',
        required: false // LEFT JOIN para incluir usuarios sin propiedades
      }],
      attributes: { exclude: ['password'] } // No exponer passwords
    });
    
    res.json({
      success: true,
      data: usuarios,
      total: usuarios.length,
      filtro: rol || 'todos'
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener usuarios' 
    });
  }
});

// GET /api/usuarios/duenos - Obtener solo usuarios con rol 'dueno'
router.get('/duenos', async (_req, res) => {
  try {
    const duenos = await Usuario.findAll({ 
      where: { rol: 'dueno' },
      include: [{
        model: Domicilio,
        as: 'propiedades'
      }],
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      data: duenos,
      total: duenos.length
    });
  } catch (error) {
    console.error('Error al obtener dueños:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener dueños' 
    });
  }
});

// GET /api/usuarios/admins - Obtener solo administradores
router.get('/admins', async (_req, res) => {
  try {
    const admins = await Usuario.findAll({ 
      where: { rol: 'admin' },
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      data: admins,
      total: admins.length
    });
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener administradores' 
    });
  }
});

// GET /api/usuarios/tesoreros - Obtener solo tesoreros
router.get('/tesoreros', async (_req, res) => {
  try {
    const tesoreros = await Usuario.findAll({ 
      where: { rol: 'tesorero' },
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      success: true,
      data: tesoreros,
      total: tesoreros.length
    });
  } catch (error) {
    console.error('Error al obtener tesoreros:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener tesoreros' 
    });
  }
});

// GET /api/usuarios/:id - Obtener un usuario específico
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { 
      include: [{
        model: Domicilio,
        as: 'propiedades',
        required: false
      }],
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }
    
    return res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener usuario' 
    });
  }
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', sanitizeInput, validateSchema('usuario'), asyncHandler(async (req: express.Request, res: express.Response) => {
  const { nombre, apellido, email, password, telefono, cedula, rol } = req.body;
  
  // Validar que el rol sea válido
  if (!['dueno', 'admin', 'tesorero'].includes(rol)) {
    return res.status(400).json({
      success: false,
      error: 'Rol inválido. Debe ser: dueno, admin o tesorero'
    });
  }
  
  const nuevoUsuario = await Usuario.create({
    nombre,
    apellido,
    email,
    password, // En producción esto debería ser hasheado
    telefono,
    cedula,
    rol
  });
  
  // Excluir password de la respuesta
  const usuarioResponse = nuevoUsuario.toJSON();
  delete usuarioResponse.password;
  
  return res.status(201).json({
    success: true,
    data: usuarioResponse,
    message: `Usuario con rol '${rol}' creado exitosamente`
  });
}));

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Validar rol si se está actualizando
    if (req.body.rol && !['dueno', 'admin', 'tesorero'].includes(req.body.rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol inválido. Debe ser: dueno, admin o tesorero'
      });
    }
    
    await usuario.update(req.body);
    
    // Excluir password de la respuesta
    const usuarioResponse = usuario.toJSON();
    delete usuarioResponse.password;
    
    return res.json({
      success: true,
      data: usuarioResponse,
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(400).json({ 
      success: false, 
      error: 'Error al actualizar usuario' 
    });
  }
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Si es un dueño, verificar que no tenga propiedades asociadas
    if (usuario.rol === 'dueno') {
      const propiedadesCount = await Domicilio.count({ where: { duenoId: req.params.id } });
      if (propiedadesCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar el usuario porque tiene propiedades asociadas'
        });
      }
    }
    
    await usuario.destroy();
    
    return res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar usuario' 
    });
  }
});

// PUT /api/usuarios/:id/toggle-status - Activar/desactivar usuario
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }
    
    await usuario.update({ activo: !usuario.activo });
    
    return res.json({
      success: true,
      data: { activo: usuario.activo },
      message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al cambiar estado del usuario' 
    });
  }
});

export default router;