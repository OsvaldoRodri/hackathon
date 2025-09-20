import express from 'express';
import { Recibo, Domicilio, Usuario } from '../models/index.js';
const router = express.Router();
// GET /api/recibos - Obtener todos los recibos
router.get('/', async (req, res) => {
    try {
        const { estado, page = 1, limit = 10 } = req.query;
        const whereCondition = {};
        if (estado) {
            whereCondition.estado = estado;
        }
        const offset = (Number(page) - 1) * Number(limit);
        const { count, rows: recibos } = await Recibo.findAndCountAll({
            where: whereCondition,
            include: [{
                    model: Domicilio,
                    include: [{
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['nombre', 'apellido']
                        }]
                }],
            order: [['fechaVencimiento', 'DESC']],
            limit: Number(limit),
            offset: offset
        });
        res.json({
            success: true,
            data: recibos,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error al obtener recibos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener recibos'
        });
    }
});
// GET /api/recibos/pendientes - Obtener recibos pendientes
router.get('/pendientes', async (_req, res) => {
    try {
        const recibosPendientes = await Recibo.findAll({
            where: { estado: 'pendiente' },
            include: [{
                    model: Domicilio,
                    include: [{
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['nombre', 'apellido']
                        }]
                }],
            order: [['fechaVencimiento', 'ASC']]
        });
        res.json({
            success: true,
            data: recibosPendientes,
            total: recibosPendientes.length
        });
    }
    catch (error) {
        console.error('Error al obtener recibos pendientes:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener recibos pendientes'
        });
    }
});
// POST /api/recibos - Crear nuevo recibo
router.post('/', async (req, res) => {
    try {
        const { numero, concepto, monto, fechaVencimiento, domicilioId } = req.body;
        // Verificar que el domicilio existe
        const domicilio = await Domicilio.findByPk(domicilioId);
        if (!domicilio) {
            return res.status(400).json({
                success: false,
                error: 'El domicilio especificado no existe'
            });
        }
        const nuevoRecibo = await Recibo.create({
            numero,
            concepto,
            monto,
            fechaVencimiento,
            domicilioId
        });
        return res.status(201).json({
            success: true,
            data: nuevoRecibo,
            message: 'Recibo creado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al crear recibo:', error);
        return res.status(400).json({
            success: false,
            error: 'Error al crear recibo'
        });
    }
});
// PUT /api/recibos/:id/pagar - Marcar recibo como pagado
router.put('/:id/pagar', async (req, res) => {
    try {
        const recibo = await Recibo.findByPk(req.params.id);
        if (!recibo) {
            return res.status(404).json({
                success: false,
                error: 'Recibo no encontrado'
            });
        }
        if (recibo.estado === 'pagado') {
            return res.status(400).json({
                success: false,
                error: 'El recibo ya está marcado como pagado'
            });
        }
        await recibo.update({
            estado: 'pagado',
            fechaPago: new Date()
        });
        return res.json({
            success: true,
            data: recibo,
            message: 'Recibo marcado como pagado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al marcar recibo como pagado:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al marcar recibo como pagado'
        });
    }
});
// GET /api/recibos/:id - Obtener recibo específico
router.get('/:id', async (req, res) => {
    try {
        const recibo = await Recibo.findByPk(req.params.id, {
            include: [{
                    model: Domicilio,
                    include: [{
                            model: Usuario,
                            as: 'propietario',
                            attributes: ['nombre', 'apellido', 'email']
                        }]
                }]
        });
        if (!recibo) {
            return res.status(404).json({
                success: false,
                error: 'Recibo no encontrado'
            });
        }
        return res.json({
            success: true,
            data: recibo
        });
    }
    catch (error) {
        console.error('Error al obtener recibo:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener recibo'
        });
    }
});
// PUT /api/recibos/:id - Actualizar recibo
router.put('/:id', async (req, res) => {
    try {
        const recibo = await Recibo.findByPk(req.params.id);
        if (!recibo) {
            return res.status(404).json({
                success: false,
                error: 'Recibo no encontrado'
            });
        }
        // Si se cambia el domicilio, verificar que existe
        if (req.body.domicilioId) {
            const domicilio = await Domicilio.findByPk(req.body.domicilioId);
            if (!domicilio) {
                return res.status(400).json({
                    success: false,
                    error: 'El domicilio especificado no existe'
                });
            }
        }
        await recibo.update(req.body);
        return res.json({
            success: true,
            data: recibo,
            message: 'Recibo actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al actualizar recibo:', error);
        return res.status(400).json({
            success: false,
            error: 'Error al actualizar recibo'
        });
    }
});
// DELETE /api/recibos/:id - Eliminar recibo
router.delete('/:id', async (req, res) => {
    try {
        const recibo = await Recibo.findByPk(req.params.id);
        if (!recibo) {
            return res.status(404).json({
                success: false,
                error: 'Recibo no encontrado'
            });
        }
        // No permitir eliminar recibos ya pagados
        if (recibo.estado === 'pagado') {
            return res.status(400).json({
                success: false,
                error: 'No se puede eliminar un recibo que ya está pagado'
            });
        }
        await recibo.destroy();
        return res.json({
            success: true,
            message: 'Recibo eliminado exitosamente'
        });
    }
    catch (error) {
        console.error('Error al eliminar recibo:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al eliminar recibo'
        });
    }
});
export default router;
//# sourceMappingURL=recibos.js.map