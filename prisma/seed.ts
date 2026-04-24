import { PrismaClient, UserRole } from '@prisma/client';

import { hashPassword } from '../src/lib/password';

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123456';
const DEFAULT_ADMIN_NAME = 'Admin';
const DEFAULT_RESTAURANT_NAME = 'Demo Restaurant';
const DEFAULT_RESTAURANT_SLUG = 'demo-restaurant';

async function ensureRestaurant() {
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: { name: DEFAULT_RESTAURANT_NAME },
  });

  if (existingRestaurant) {
    return existingRestaurant;
  }

  return prisma.restaurant.upsert({
    where: { slug: DEFAULT_RESTAURANT_SLUG },
    update: { name: DEFAULT_RESTAURANT_NAME },
    create: {
      name: DEFAULT_RESTAURANT_NAME,
      slug: DEFAULT_RESTAURANT_SLUG,
    },
  });
}

async function ensureAdminUser() {
  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  return prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      name: DEFAULT_ADMIN_NAME,
      passwordHash,
      isActive: true,
    },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      name: DEFAULT_ADMIN_NAME,
      passwordHash,
      isActive: true,
    },
  });
}

async function ensureAdminMembership(userId: number, restaurantId: number) {
  await prisma.userRestaurantRole.upsert({
    where: {
      userId_restaurantId_role: {
        userId,
        restaurantId,
        role: UserRole.ADMIN,
      },
    },
    update: {},
    create: {
      userId,
      restaurantId,
      role: UserRole.ADMIN,
    },
  });
}

async function main() {
  const restaurant = await ensureRestaurant();
  const adminUser = await ensureAdminUser();

  await ensureAdminMembership(adminUser.id, restaurant.id);

  console.log('✅ Seed completed');
  console.log(`email: ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`password: ${DEFAULT_ADMIN_PASSWORD}`);
  console.log(`restaurant: ${restaurant.name}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
