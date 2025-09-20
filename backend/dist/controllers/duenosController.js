import { Usuario, Domicilio } from '../models/index.js';
export class UsuariosController {
    static async getAllUsuarios(_req, res) {
        try {
            const usuarios = await Usuario.findAll({
                include: [Domicilio]
            });
            res.json({
                success: true,
                data: usuarios,
                total: usuarios.length
            });
        }
        catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener usuarios'
            });
        }
    }
    static async getUsuarioById(req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id, {
                include: [Domicilio]
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
        }
        catch (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener usuario'
            });
        }
    }
    static async createUsuario(req, res) {
        try {
            const usuario = await Usuario.create(req.body);
            return res.status(201).json({
                success: true,
                data: usuario,
                message: 'Usuario creado exitosamente'
            });
        }
        catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al crear usuario'
            });
        }
    }
}
//# sourceMappingURL=duenosController.js.map