import express from 'express';
import { Dueno, Domicilio } from '../models/index.js';
import { validateSchema, sanitizeInput } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
const router = express.Router();
// GET /api/duenos - Obtener todos los dueños
router.get('/', async (_req, res) => {
    try {
        const duenos = await Dueno.findAll({ include: [Domicilio] });
        res.json({
            success: true,
            data: duenos,
            total: duenos.length
        });
    }
    catch (error) {
        console.error('Error al obtener dueños:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener dueños'
        });
    }
});
// GET /api/duenos/:id - Obtener un dueño específico
router.get('/:id', async (req, res) => {
    try {
        const dueno = await Dueno.findByPk(req.params.id, {
            include: [Domicilio]
        });
        if (!dueno) {
            return res.status(404).json({
                success: false,
                error: 'Dueño no encontrado'
            });
        }
        return res.json({
            success: true,
            data: dueno
        });
    }
    catch (error) {
        console.error('Error al obtener dueño:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener dueño'
        });
    }
});
// POST /api/duenos - Crear nuevo dueño
router.post('/', sanitizeInput, validateSchema('dueno'), asyncHandler(async (req, res) => {
    const { nombre, apellido, email, telefono, cedula } = req.body;
    const nuevoDueno = await Dueno.create({
        nombre,
        apellido,
        email,
        telefono,
        cedula
    });
    return res.status(201).json({
        success: true,
        data: nuevoDueno,
        message: 'Dueño creado exitosamente'
    });
}));
// PUT /api/duenos/:id - Actualizar dueño
router.put('/:id', async (req, res) => {
    try {
        const dueno = await Dueno.findByPk(req.params.id);
        if (!dueno) {
            return res.status(404).json({
                success: false,
                error: 'Dueño no encontrado'
            });
        }
        await dueno.update(req.body);
        return res.json({
            success: true,
            data: dueno,
            message: 'Dueño actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al actualizar dueño:', error);
        return res.status(400).json({
            success: false,
            error: 'Error al actualizar dueño'
        });
    }
});
// DELETE /api/duenos/:id - Eliminar dueño
router.delete('/:id', async (req, res) => {
    try {
        const dueno = await Dueno.findByPk(req.params.id);
        if (!dueno) {
            return res.status(404).json({
                success: false,
                error: 'Dueño no encontrado'
            });
        }
        await dueno.destroy();
        return res.json({
            success: true,
            message: 'Dueño eliminado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al eliminar dueño:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al eliminar dueño'
        });
    }
});
export default router;
//# sourceMappingURL=duenos.js.map