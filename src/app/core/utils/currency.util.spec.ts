import { formatCurrencyToBrl, formatNumberToBrl, parsePriceInput, sanitizePriceInput } from './currency.util';

describe('currency.util', () => {
  describe('sanitizePriceInput', () => {
    it('mantem apenas caracteres validos de numero e separador decimal', () => {
      expect(sanitizePriceInput('R$ 1.234,56')).toBe('1.234,56');
      expect(sanitizePriceInput('abc')).toBe('');
    });

    it('remove caracteres nao numericos', () => {
      expect(sanitizePriceInput('12a,3b4')).toBe('12,34');
      expect(sanitizePriceInput('1 2 3')).toBe('123');
    });
  });

  describe('parsePriceInput', () => {
    it('converte valores com virgula decimal', () => {
      expect(parsePriceInput('1,50')).toBe(1.5);
    });

    it('converte valores com ponto decimal', () => {
      expect(parsePriceInput('199.99')).toBe(199.99);
    });

    it('retorna null para vazio ou invalido', () => {
      expect(parsePriceInput('')).toBeNull();
      expect(parsePriceInput('-10')).toBeNull();
      expect(parsePriceInput('abc')).toBeNull();
    });

    it('trunca para no maximo duas casas decimais', () => {
      expect(parsePriceInput('12,003')).toBe(12003);
      expect(parsePriceInput('10.567')).toBe(10567);
    });

    it('interpreta separador de milhar com um unico separador', () => {
      expect(parsePriceInput('1.200')).toBe(1200);
      expect(parsePriceInput('1,200')).toBe(1200);
    });
  });

  describe('formatters', () => {
    it('formata numero padrao pt-BR sem simbolo', () => {
      expect(formatNumberToBrl(1299.9)).toBe('1.299,90');
      expect(formatNumberToBrl(12)).toBe('12,00');
    });

    it('formata moeda BRL com simbolo', () => {
      expect(formatCurrencyToBrl(289.5)).toBe('R$\u00a0289,50');
    });
  });
});
