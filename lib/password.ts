import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/* =========================================================
   HASH PASSWORD
========================================================= */

export async function hashPassword(
  password: string
): Promise<string> {
  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  return bcrypt.hash(
    password,
    SALT_ROUNDS
  );
}

/* =========================================================
   VERIFY PASSWORD
========================================================= */

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(
    password,
    hashedPassword
  );
}