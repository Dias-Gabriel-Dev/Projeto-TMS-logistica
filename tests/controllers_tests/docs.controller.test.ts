import request from 'supertest';
import express from 'express';

describe('Swagger Documentation (OpenAPI 3.0)', () => {
  let app: express.Express;
  let swaggerSpec: any;
  let swaggerUi: any;

  beforeAll(async () => {
    app = express();

    try {
      const swaggerModule = await import('../../src/config/swagger.js');
      swaggerSpec = swaggerModule.swaggerSpec;
      swaggerUi = swaggerModule.swaggerUi;

      if (swaggerSpec && swaggerUi) {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      }
    } catch (e) {
      // Fase Red
    }
  });

  it('deve gerar a especificação OpenAPI 3.0 com metadados e configuração de Bearer Auth', () => {
    if (!swaggerSpec) {
      throw new Error('swaggerSpec não foi exportado em src/config/swagger.ts');
    }

    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.info).toHaveProperty('title');
    expect(swaggerSpec.info).toHaveProperty('version');
    expect(swaggerSpec.components?.securitySchemes).toHaveProperty('bearerAuth');
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toHaveProperty('type', 'http');
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toHaveProperty('scheme', 'bearer');
  });

  it('deve responder com sucesso (200 ou redirect 301) ao acessar a rota /api-docs', async () => {
    if (!swaggerUi || !swaggerSpec) {
      throw new Error('Swagger não foi configurado');
    }

    const response = await request(app).get('/api-docs/');
    expect([200, 301, 302]).toContain(response.status);
  });
});
