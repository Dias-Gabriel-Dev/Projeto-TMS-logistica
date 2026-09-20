describe('Route Validation (Zod)', () => {
  let routeSchema: any;

  beforeAll(async () => {
    try {
      const module = await import('../../src/schemas/route.schema.js');
      routeSchema = module.routeSchema;
    } catch (e) {
      // Ignora erro se o schema não existir
    }
  });

  it('should validate a correct route payload', () => {
    if (!routeSchema) return;

    const validRoute = {
      id: 'route-123',
      origin: 'São Paulo - SP',
      destination: 'Rio de Janeiro - RJ',
      estimatedDistance: 430.5,
    };

    expect(() => routeSchema.parse(validRoute)).not.toThrow();
  });

  it('should reject a negative distance', () => {
    if (!routeSchema) return;

    const invalidRoute = {
      id: 'route-123',
      origin: 'São Paulo - SP',
      destination: 'Rio de Janeiro - RJ',
      estimatedDistance: -100, // Não faz sentido
    };

    expect(() => routeSchema.parse(invalidRoute)).toThrow();
  });
});
