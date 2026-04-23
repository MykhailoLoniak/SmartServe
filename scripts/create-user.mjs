import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const ITERATIONS = 64;
const KEYLEN = 64;
const DIGEST = "sha512";

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS * 1000, KEYLEN, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
  return \`pbkdf2$\${ITERATIONS}$\${salt}$\${hash}\`;
}

async function main() {
  const email = "admin@example.com";
  const password = "admin123456";
  const name = "Admin";
  const restaurantId = 1;
  const role = "ADMIN";

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, isActive: true },
    create: { email, name, passwordHash, isActive: true },
  });

  await prisma.userRestaurantRole.create({
    data: {
      userId: user.id,
      restaurantId,
      role,
    },
  });

  console.log("✅ User created:");
  console.log({ email, password, userId: user.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
