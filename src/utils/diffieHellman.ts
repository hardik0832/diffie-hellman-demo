// Diffie-Hellman utility functions

/**
 * Modular exponentiation for Diffie-Hellman key exchange
 * @param base - The base number
 * @param exponent - The exponent
 * @param modulus - The modulus (prime number)
 * @returns The result of base^exponent mod modulus
 */
export function modPow(base: number, exponent: number, modulus: number): number {
  if (modulus <= 0) {
    throw new Error('Modulus must be positive');
  }
  
  let result = 1;
  base = base % modulus;
  
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  
  return result;
}

/**
 * Generate a random private key
 * @param maxValue - Maximum value for the private key (default: 100)
 * @returns A random private key
 */
export function generatePrivateKey(maxValue: number = 100): number {
  return Math.floor(Math.random() * maxValue) + 1;
}

/**
 * Compute public key from private key
 * @param privateKey - The private key
 * @param generator - The generator (g)
 * @param prime - The prime number (p)
 * @returns The public key
 */
export function computePublicKey(privateKey: number, generator: number, prime: number): number {
  if (privateKey <= 0 || privateKey >= prime) {
    throw new Error('Private key must be positive and less than the prime');
  }
  
  return modPow(generator, privateKey, prime);
}

/**
 * Compute shared secret
 * @param privateKey - Your private key
 * @param otherPublicKey - The other party's public key
 * @param prime - The prime number (p)
 * @returns The shared secret
 */
export function computeSharedSecret(privateKey: number, otherPublicKey: number, prime: number): number {
  if (otherPublicKey <= 0) {
    throw new Error('Other public key must be positive');
  }
  
  return modPow(otherPublicKey, privateKey, prime);
}

/**
 * Validate prime number for Diffie-Hellman
 * @param prime - The prime number to validate
 * @returns True if valid, false otherwise
 */
export function isValidPrime(prime: number): boolean {
  if (prime <= 1) return false;
  if (prime <= 3) return true;
  if (prime % 2 === 0) return false;
  
  // Simple primality test for small numbers
  for (let i = 3; i <= Math.sqrt(prime); i += 2) {
    if (prime % i === 0) return false;
  }
  
  return true;
}

/**
 * Default values for demonstration
 */
export const DEFAULT_P = 23; // Small prime for demo
export const DEFAULT_G = 5;  // Small generator for demo 