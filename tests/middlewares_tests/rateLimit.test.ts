import request from 'supertest';
import express from 'express';

describe('Rate Limit Middleware (Brute Force Protection)', () => {
  let app: express.Express;
  let authLimiter: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());

    try {
      const rateLimitModule = await import('../../src/middlewares/rateLimiters.js');
      authLimiter = rateLimitModule.authLimiter;

      if (authLimiter) {
        app.post('/auth/login', authLimiter, (req, res) => {
          res.status(200).json({ message: 'Login efetuado com sucesso' });
        });
      }
    } catch (e) {
      // Fase Red
    }
  });

  it('deve permitir requisições legítimas dentro do limite permitido (até 5 tentativas)', async () => {
    if (!authLimiter) {
      throw new Error('authLimiter não foi exportado em src/middlewares/rateLimiters.ts');
    }

    const response = await request(app).post('/auth/login').send({
      email: 'teste@logistica.com',
      password: 'senhaValida123',
    });

    expect(response.status).toBe(200);
  });

  it('deve bloquear e retornar status 429 após ultrapassar o limite de 5 requisições na janela', async () => {
    if (!authLimiter) {
      throw new Error('authLimiter não foi exportado em src/middlewares/rateLimiters.ts');
    }

    // Dispara 4 requisições adicionais (completando 5)
    for (let i = 0; i < 4; i++) {
      await request(app).post('/auth/login').send({
        email: 'invasor@teste.com',
        password: 'senhaInvalida',
      });
    }

    // A 6ª requisição deve ser sumariamente bloqueada com HTTP 429
    const blockedResponse = await request(app).post('/auth/login').send({
      email: 'invasor@teste.com',
      password: 'senhaInvalida',
    });

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body).toHaveProperty(
      'error',
      'Muitas tentativas de login. Tente novamente em 15 minutos.'
    );
  });
});
