import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const HASH_PREFIX = 'scrypt';
const KEY_LENGTH = 64;

/**
 * Genera un hash criptográfico seguro con sal aleatoria usando scrypt (Node.js nativo).
 * Cumple con OWASP y Estándar PLAi v1.0 Sección 7 (nunca contraseñas en texto plano).
 */
export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

/**
 * Verifica una contraseña en texto plano contra su hash scrypt en tiempo constante.
 */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!plainPassword || !storedHash) {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }

  const [, salt, keyHex] = parts;
  if (!salt || !keyHex) {
    return false;
  }

  try {
    const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH);
    const storedKey = Buffer.from(keyHex, 'hex');
    if (derivedKey.length !== storedKey.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}
