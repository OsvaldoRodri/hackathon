import express from 'express';
import { Domicilio, Usuario, Recibo } from '../models/index.js';
const router = express.Router();
// GET /api/domicilios - Obtener todos los domicilios
router.get('/', async (_req, res) => {
    try {
        const domicilios = await Domicilio.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'rol'],
                    where: { rol: 'dueno' }
                },
                { model: Recibo, attributes: ['id', 'numero', 'estado', 'monto'] }
            ]
        });
        res.json({
            success: true,
            data: domicilios,
            total: domicilios.length
        });
    }
    catch (error) {
        console.error('Error al obtener domicilios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener domicilios'
        });
    }
});
// GET /api/domicilios/:id - Obtener domicilio específico
router.get('/:id', async (req, res) => {
    try {
        const domicilio = await Domicilio.findByPk(req.params.id, {
            include: [
                {
                    model: Usuario,
                    as: 'propietario',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
                },
                Recibo
            ]
        });
        if (!domicilio) {
            return res.status(404).json({
                success: false,
                error: 'Domicilio no encontrado'
            });
        }
        return res.json({
            success: true,
            data: domicilio
        });
    }
    catch (error) {
        console.error('Error al obtener domicilio:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener domicilio'
        });
    }
});
// POST /api/domicilios - Crear nuevo domicilio
router.post('/', async (req, res) => {
    try {
        const { numero, bloque, area, tipo, duenoId } = req.body;
        // Verificar que el usuario existe y es un dueño
        const usuario = await Usuario.findByPk(duenoId);
        if (!usuario) {
            return res.status(400).json({
                success: false,
                error: 'El usuario especificado no existe'
            });
        }
        if (usuario.rol !== 'dueno') {
            return res.status(400).json({
                success: false,
                error: 'Solo usuarios con rol "dueno" pueden tener propiedades asignadas'
            });
        }
        const nuevoDomicilio = await Domicilio.create({
            numero,
            bloque,
            area,
            tipo,
            duenoId
        });
        return res.status(201).json({
            success: true,
            data: nuevoDomicilio,
            message: 'Domicilio creado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al crear domicilio:', error);
        return res.status(400).json({
            success: false,
            error: 'Error al crear domicilio'
        });
    }
});
// PUT /api/domicilios/:id - Actualizar domicilio
router.put('/:id', async (req, res) => {
    try {
        const domicilio = await Domicilio.findByPk(req.params.id);
        if (!domicilio) {
            return res.status(404).json({
                success: false,
                error: 'Domicilio no encontrado'
            });
        }
        // Si se cambia el dueño, verificar que existe y es dueño
        if (req.body.duenoId) {
            const usuario = await Usuario.findByPk(req.body.duenoId);
            if (!usuario) {
                return res.status(400).json({
                    success: false,
                    error: 'El usuario especificado no existe'
                });
            }
            if (usuario.rol !== 'dueno') {
                return res.status(400).json({
                    success: false,
                    error: 'Solo usuarios con rol "dueno" pueden tener propiedades asignadas'
                });
            }
        }
        await domicilio.update(req.body);
        return res.json({
            success: true,
            data: domicilio,
            message: 'Domicilio actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al actualizar domicilio:', error);
        return res.status(400).json({
            success: false,
            error: 'Error al actualizar domicilio'
        });
    }
});
// DELETE /api/domicilios/:id - Eliminar domicilio
router.delete('/:id', async (req, res) => {
    try {
        const domicilio = await Domicilio.findByPk(req.params.id);
        if (!domicilio) {
            return res.status(404).json({
                success: false,
                error: 'Domicilio no encontrado'
            });
        }
        // Verificar si tiene recibos asociados
        const recibosCount = await Recibo.count({ where: { domicilioId: req.params.id } });
        if (recibosCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'No se puede eliminar el domicilio porque tiene recibos asociados'
            });
        }
        await domicilio.destroy();
        return res.json({
            success: true,
            message: 'Domicilio eliminado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al eliminar domicilio:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al eliminar domicilio'
        });
    }
});
// GET /api/domicilios/:id/recibos - Recibos de un domicilio específico
router.get('/:id/recibos', async (req, res) => {
    try {
        const { estado } = req.query;
        const whereCondition = { domicilioId: req.params.id };
        if (estado) {
            whereCondition.estado = estado;
        }
        const recibos = await Recibo.findAll({
            where: whereCondition,
            include: [{
                    model: Domicilio,
                    include: [{
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['id', 'nombre', 'apellido', 'email']
                        }]
                }],
            order: [['fechaVencimiento', 'DESC']]
        });
        res.json({
            success: true,
            data: recibos,
            total: recibos.length
        });
    }
    catch (error) {
        console.error('Error al obtener recibos del domicilio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener recibos del domicilio'
        });
    }
});
export default router;
//# sourceMappingURL=domicilios.js.map