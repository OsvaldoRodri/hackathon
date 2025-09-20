import { Request, Response } from 'express';
export declare class UsuariosController {
    static getAllUsuarios(_req: Request, res: Response): Promise<void>;
    static getUsuarioById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createUsuario(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=duenosController.d.ts.map