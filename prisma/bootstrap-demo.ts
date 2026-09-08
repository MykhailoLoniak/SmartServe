import { PrismaClient } from "@prisma/client";

import { seedDemoData } from "./seed";

const prisma = new PrismaClient();
const confirmation = "CREATE_DEMO_DATA";

const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

async function main() {
  if (process.env.BOOTSTRAP_DEMO_CONFIRM !== confirmation) {
    throw new Error(`Refusing to create demo data. Set BOOTSTRAP_DEMO_CONFIRM=${confirmation} explicitly.`);
  }

  const email = required("BOOTSTRAP_OWNER_EMAIL").toLowerCase();
  const password = required("BOOTSTRAP_OWNER_PASSWORD");
  const name = required("BOOTSTRAP_OWNER_NAME");
  if (password.length < 12) throw new Error("BOOTSTRAP_OWNER_PASSWORD must be at least 12 characters.");

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) throw new Error("A user with BOOTSTRAP_OWNER_EMAIL already exists. Refusing to overwrite it.");

  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { slug: { in: ["smart-bistro", "pasta-grill"] } },
    select: { slug: true },
  });
  if (existingRestaurant) throw new Error(`Demo restaurant ${existingRestaurant.slug} already exists. Refusing to modify existing data.`);

  const { restaurants } = await seedDemoData({ email, password, name });
  console.log(`Demo bootstrap complete for ${email}. Restaurants: ${restaurants.map((restaurant) => restaurant.name).join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Demo bootstrap failed", error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
