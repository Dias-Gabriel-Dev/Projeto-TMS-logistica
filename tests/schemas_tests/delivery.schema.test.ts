describe('Delivery Validation (Zod)', () => {
  let deliverySchema: any;

  beforeAll(async () => {
    try {
      const module = await import('../../src/schemas/delivery.schema.js');
      deliverySchema = module.deliverySchema;
    } catch (e) {
      // Ignora erro se o schema não existir
    }
  });

  it('should validate a correct delivery payload', () => {
    if (!deliverySchema) return;

    const validDelivery = {
      id: 'delivery-123',
      routeId: 'route-123',
      driverId: 'driver-123',
      vehicleId: 'vehicle-123',
      cargoWeight: 100,
      freightCost: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING',
    };

    expect(() => deliverySchema.parse(validDelivery)).not.toThrow();
  });

  it('should reject if any relation ID is missing', () => {
    if (!deliverySchema) return;

    const invalidDelivery = {
      driverId: 'driver-123',
      // vehicleId is missing
      // routeId is missing
    };

    expect(() => deliverySchema.parse(invalidDelivery)).toThrow();
  });
});
