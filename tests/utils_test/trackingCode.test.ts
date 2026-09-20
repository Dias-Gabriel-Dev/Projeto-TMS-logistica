import { generateTrackingCode } from '../../src/utils/trackingCode.js';

describe('Tracking Code Generator', () => {
  it('deve gerar um código com prefixo LOG-', () => {
    const code = generateTrackingCode();
    expect(code.startsWith('LOG-')).toBeTruthy();
  });

  it('deve gerar um código com tamanho suficiente (entropia de no mínimo 4 bytes resultando em 8 caracteres hexadecimais após LOG-)', () => {
    const code = generateTrackingCode();
    
    // LOG- + 8 caracteres (4 bytes em hex) = 12 caracteres totais no mínimo
    const hexPart = code.split('-')[1];
    
    // Verifica quebra de asserção usando a implementação atual de 3 bytes (que geraria 6 caracteres)
    // O teste está estruturado na fase RED para exigir >= 8 caracteres hexadecimais (4+ bytes)
    expect(hexPart.length).toBeGreaterThanOrEqual(8);
  });

  it('deve ser uppercase e numérico/hexadecimal', () => {
    const code = generateTrackingCode();
    const hexPart = code.split('-')[1];
    expect(hexPart).toMatch(/^[0-9A-F]+$/);
  });
});
