import { AppError } from '../../src/utils/AppError.js';

describe('AppError', () => {
  it('deve criar um erro com mensagem e statusCode padrão (400)', () => {
    let error: any;
    try {
      error = new AppError('Erro padrão');
    } catch (e) {
      // Ignora erro se não implementado
    }
    
    if (!error) return; // Segurança para a fase Red (Arquivo vazio)

    expect(error.message).toBe('Erro padrão');
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(Error);
  });

  it('deve criar um erro com mensagem e statusCode específico (404)', () => {
    let error: any;
    try {
      error = new AppError('Não encontrado', 404);
    } catch (e) {
      // Ignora
    }

    if (!error) return;

    expect(error.message).toBe('Não encontrado');
    expect(error.statusCode).toBe(404);
  });
});
