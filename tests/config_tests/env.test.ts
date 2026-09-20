describe('Environment Configuration (Fail-Fast com Zod)', () => {
  let envModule: any;

  beforeAll(async () => {
    try {
      envModule = await import('../../src/config/env.js');
    } catch (e) {
      // Fase Red do TDD
    }
  });

  it('deve exportar envSchema e validar variáveis de ambiente válidas com sucesso', () => {
    if (!envModule?.envSchema) {
      throw new Error('envSchema não foi exportado em src/config/env.ts');
    }

    const validData = {
      DATABASE_URL: 'postgresql://admin:adminpassword@localhost:5432/api_logistica?schema=public',
      JWT_SECRET: 'minha_chave_secreta_super_forte',
      PORT: '4000',
    };

    const result = envModule.envSchema.safeParse(validData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.DATABASE_URL).toBe(validData.DATABASE_URL);
      expect(result.data.JWT_SECRET).toBe(validData.JWT_SECRET);
      expect(result.data.PORT).toBe(4000); // Deve converter string para número via coerce
    }
  });

  it('deve adotar a porta padrão 3000 caso PORT não seja fornecido', () => {
    if (!envModule?.envSchema) {
      throw new Error('envSchema não foi exportado em src/config/env.ts');
    }

    const dataWithoutPort = {
      DATABASE_URL: 'postgresql://admin:adminpassword@localhost:5432/api_logistica?schema=public',
      JWT_SECRET: 'minha_chave_secreta_super_forte',
    };

    const result = envModule.envSchema.safeParse(dataWithoutPort);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(3000);
    }
  });

  it('deve rejeitar a configuração se JWT_SECRET estiver ausente ou for vazio', () => {
    if (!envModule?.envSchema) {
      throw new Error('envSchema não foi exportado em src/config/env.ts');
    }

    const missingSecret = {
      DATABASE_URL: 'postgresql://admin:adminpassword@localhost:5432/api_logistica?schema=public',
    };

    const result = envModule.envSchema.safeParse(missingSecret);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i: any) => i.path.includes('JWT_SECRET'));
      expect(issue).toBeDefined();
    }
  });

  it('deve rejeitar a configuração se DATABASE_URL estiver ausente ou for vazia', () => {
    if (!envModule?.envSchema) {
      throw new Error('envSchema não foi exportado em src/config/env.ts');
    }

    const missingDbUrl = {
      JWT_SECRET: 'minha_chave_secreta_super_forte',
    };

    const result = envModule.envSchema.safeParse(missingDbUrl);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i: any) => i.path.includes('DATABASE_URL'));
      expect(issue).toBeDefined();
    }
  });

  it('deve exportar a constante env já validada e tipada', () => {
    if (!envModule?.env) {
      throw new Error('env não foi exportado em src/config/env.ts');
    }

    expect(envModule.env).toHaveProperty('DATABASE_URL');
    expect(envModule.env).toHaveProperty('JWT_SECRET');
    expect(envModule.env).toHaveProperty('PORT');
  });
});
