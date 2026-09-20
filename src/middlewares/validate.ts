import { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod';

export const validate =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ errors: result.error.issues, message: 'Erro de Validação (Zod)' });
    }
    req.body = result.data;
    next();
  };
