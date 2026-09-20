import crypto from 'crypto';

/**
 * Gera um código de rastreio no formato LOG-XXXXXX
 * @returns {string} Código de rastreio
 */
export const generateTrackingCode = (): string => {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LOG-${randomHex}`;
};
