import request from 'supertest';
import express from 'express';

// Testando o comportamento do middleware de segurança (Helmet)
describe('Security Headers Middleware (Helmet)', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();

    try {
      const helmetModule = await import('helmet');
      const helmet = helmetModule.default || helmetModule;
      app.use(helmet());
    } catch (e) {
      // Fase Red: se o pacote ainda não estiver instalado
    }

    app.get('/test-security', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  });

  it('deve remover o header X-Powered-By para não expor a tecnologia do servidor', async () => {
    const response = await request(app).get('/test-security');

    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('deve injetar cabeçalhos de segurança essenciais (ex: X-Content-Type-Options: nosniff)', async () => {
    const response = await request(app).get('/test-security');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
