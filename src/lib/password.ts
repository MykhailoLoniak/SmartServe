import crypto from "node:crypto";

const ITERATIONS = 64;
const KEYLEN = 64;
const DIGEST = "sha512";

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS * 1000, KEYLEN, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
};

export const verifyPassword = async (password: string, encoded: string) => {
  const [algo, roundsRaw, salt, expected] = encoded.split("$");
  if (algo !== "pbkdf2" || !roundsRaw || !salt || !expected) return false;
  const rounds = Number.parseInt(roundsRaw, 10);
  const actual = await new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, rounds * 1000, KEYLEN, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
};
