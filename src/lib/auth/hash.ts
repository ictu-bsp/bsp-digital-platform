//src/lib/auth/hash.ts

import argon2 from "argon2";
/**
 * Hashes a plain-text password using the Argon2 key derivation algorithm.
 * @param password - The raw, plain-text password provided during registration or password change.
 * @returns A promise that resolves to the secure Argon2 hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}
/**
 * Verifies a plain-text password against a stored Argon2 hash string.
 * @param password - The raw password entered during login attempt.
 * @param hash - The Argon2 hash string fetched from the database.
 * @returns A promise that resolves to `true` if credentials match, or `false` if invalid.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}