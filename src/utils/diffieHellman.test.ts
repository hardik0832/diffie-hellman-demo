import { modPow, computePublicKey, computeSharedSecret, DEFAULT_P, DEFAULT_G } from './diffieHellman';

describe('diffieHellman utils', () => {
  test('modPow computes correct modular exponentiation', () => {
    expect(modPow(2, 5, 13)).toBe(6); // 32 mod 13 = 6
    expect(modPow(5, 0, 23)).toBe(1);
  });

  test('computePublicKey uses generator^private mod prime', () => {
    const p = DEFAULT_P;
    const g = DEFAULT_G;
    const a = 6;
    const publicKey = computePublicKey(a, g, p);
    expect(publicKey).toBe(modPow(g, a, p));
  });

  test('shared secret symmetry between parties', () => {
    const p = DEFAULT_P;
    const g = DEFAULT_G;
    const a = 3;
    const b = 10;
    const A = computePublicKey(a, g, p);
    const B = computePublicKey(b, g, p);

    const secretAlice = computeSharedSecret(a, B, p);
    const secretBob = computeSharedSecret(b, A, p);

    expect(secretAlice).toBe(secretBob);
  });
});