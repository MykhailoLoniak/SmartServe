import { PrismaClient, UserRole } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") {
  throw new Error("Demo seed is disabled in production");
}

const DEFAULT_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin123456";
const DEFAULT_ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Demo Admin";

type SeedMenuItem = {
  name: string;
  description: string;
  price: string;
  estimatedTime: number;
  isAvailable?: boolean;
  requiresKitchen?: boolean;
};

type SeedCategory = {
  name: string;
  items: SeedMenuItem[];
};

type SeedRestaurant = {
  name: string;
  slug: string;
  logoUrl?: string;
  tables: number[];
  categories: SeedCategory[];
};

const RESTAURANTS: SeedRestaurant[] = [
  {
    name: "Smart Bistro",
    slug: "smart-bistro",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    tables: [1, 2, 3, 4, 5, 6],
    categories: [
      {
        name: "Сніданки",
        items: [
          {
            name: "Авокадо-тост з яйцем пашот",
            description: "Заквасний хліб, авокадо, яйце пашот, мікрозелень і томати чері.",
            price: "235.00",
            estimatedTime: 12,
          },
          {
            name: "Сирники зі сметаною",
            description: "Ніжні сирники з ягідним соусом, сметаною та цукровою пудрою.",
            price: "195.00",
            estimatedTime: 14,
          },
          {
            name: "Омлет з лососем",
            description: "Три яйця, слабосолений лосось, вершковий сир і салатний мікс.",
            price: "265.00",
            estimatedTime: 13,
          },
        ],
      },
      {
        name: "Основні страви",
        items: [
          {
            name: "Куряче філе з кремовим пюре",
            description: "Соковите куряче філе, картопляне пюре, грибний соус і сезонні овочі.",
            price: "315.00",
            estimatedTime: 22,
          },
          {
            name: "Паста карбонара",
            description: "Спагеті, бекон, жовток, пармезан і чорний перець.",
            price: "285.00",
            estimatedTime: 18,
          },
          {
            name: "Стейк з телятини",
            description: "Телячий стейк, печена картопля, зелена квасоля та перцевий соус.",
            price: "495.00",
            estimatedTime: 28,
          },
        ],
      },
      {
        name: "Десерти",
        items: [
          {
            name: "Чизкейк Нью-Йорк",
            description: "Класичний вершковий чизкейк з ягідним конфі.",
            price: "165.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Шоколадний фондан",
            description: "Теплий шоколадний кекс з рідкою серцевиною та ванільним морозивом.",
            price: "185.00",
            estimatedTime: 12,
          },
        ],
      },
      {
        name: "Напої",
        items: [
          {
            name: "Капучино",
            description: "Еспресо з молочною піною.",
            price: "85.00",
            estimatedTime: 4,
            requiresKitchen: false,
          },
          {
            name: "Лимонад маракуя-м'ята",
            description: "Домашній лимонад з маракуєю, лаймом і свіжою м'ятою.",
            price: "125.00",
            estimatedTime: 6,
            requiresKitchen: false,
          },
          {
            name: "Матча латте",
            description: "Японська матча з молоком на вибір.",
            price: "115.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
        ],
      },
    ],
  },
  {
    name: "Pasta & Grill",
    slug: "pasta-grill",
    logoUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80",
    tables: [1, 2, 3, 4, 5, 6, 7, 8],
    categories: [
      {
        name: "Антипасті",
        items: [
          {
            name: "Брускета з томатами",
            description: "Підсмажена чіабата, томати, базилік, часник і оливкова олія.",
            price: "155.00",
            estimatedTime: 8,
          },
          {
            name: "Карпачо з яловичини",
            description: "Тонкі слайси яловичини, рукола, каперси, пармезан і лимонна заправка.",
            price: "295.00",
            estimatedTime: 10,
          },
          {
            name: "Сирна тарілка",
            description: "Добірка сирів, горіхи, мед і грісіні.",
            price: "345.00",
            estimatedTime: 7,
            requiresKitchen: false,
          },
        ],
      },
      {
        name: "Паста",
        items: [
          {
            name: "Тальятеле болоньєзе",
            description: "Домашня паста з м'ясним рагу, томатами та пармезаном.",
            price: "325.00",
            estimatedTime: 20,
          },
          {
            name: "Равіолі з рікотою та шпинатом",
            description: "Равіолі у вершково-шавлієвому соусі з пармезаном.",
            price: "335.00",
            estimatedTime: 21,
          },
          {
            name: "Фетучині з креветками",
            description: "Паста з креветками, часником, вершками, томатами чері та петрушкою.",
            price: "395.00",
            estimatedTime: 19,
          },
        ],
      },
      {
        name: "Гриль",
        items: [
          {
            name: "Рібай стейк",
            description: "Стейк рібай з соусом деміглас, картоплею та салатом.",
            price: "690.00",
            estimatedTime: 30,
          },
          {
            name: "Лосось на грилі",
            description: "Філе лосося, спаржа, лимонне масло та зелений салат.",
            price: "520.00",
            estimatedTime: 24,
          },
          {
            name: "Курча пірі-пірі",
            description: "Мариноване курча з гострим соусом, кукурудзою та картоплею.",
            price: "385.00",
            estimatedTime: 26,
          },
        ],
      },
      {
        name: "Бар",
        items: [
          {
            name: "Aperol Spritz",
            description: "Aperol, prosecco, содова та апельсин.",
            price: "210.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Еспресо тонік",
            description: "Подвійний еспресо, тонік, лід і цитрус.",
            price: "125.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Мінеральна вода",
            description: "Газована або негазована вода 500 мл.",
            price: "75.00",
            estimatedTime: 2,
            requiresKitchen: false,
          },
        ],
      },
    ],
  },
];

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

async function ensureRestaurant(seed: SeedRestaurant, ownerId: number) {
  return prisma.restaurant.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      logoUrl: seed.logoUrl ?? null,
      updatedById: ownerId,
    },
    create: {
      name: seed.name,
      slug: seed.slug,
      logoUrl: seed.logoUrl ?? null,
      createdById: ownerId,
      updatedById: ownerId,
    },
  });
}

async function ensureOwnerMembership(userId: number, restaurantId: number) {
  await prisma.userRestaurantRole.deleteMany({
    where: {
      userId,
      restaurantId,
      role: UserRole.ADMIN,
    },
  });

  await prisma.userRestaurantRole.upsert({
    where: {
      userId_restaurantId_role: {
        userId,
        restaurantId,
        role: UserRole.OWNER,
      },
    },
    update: {},
    create: {
      userId,
      restaurantId,
      role: UserRole.OWNER,
    },
  });
}

async function ensureTable(restaurantSlug: string, restaurantId: number, number: number) {
  const existingTable = await prisma.table.findFirst({
    where: { restaurantId, number },
  });

  if (existingTable) {
    return existingTable;
  }

  return prisma.table.create({
    data: {
      restaurantId,
      number,
      qrSlug: crypto.randomUUID(),
    },
  });
}

async function ensureCategory(restaurantId: number, ownerId: number, name: string) {
  return prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId,
        name,
      },
    },
    update: {
      updatedById: ownerId,
    },
    create: {
      restaurantId,
      name,
      createdById: ownerId,
      updatedById: ownerId,
    },
  });
}

async function ensureMenuItem(categoryId: number, ownerId: number, item: SeedMenuItem) {
  const existingItem = await prisma.menuItem.findFirst({
    where: {
      categoryId,
      name: item.name,
    },
  });

  const data = {
    description: item.description,
    price: item.price,
    estimatedTime: item.estimatedTime,
    isAvailable: item.isAvailable ?? true,
    requiresKitchen: item.requiresKitchen ?? true,
    updatedById: ownerId,
  };

  if (existingItem) {
    return prisma.menuItem.update({
      where: { id: existingItem.id },
      data,
    });
  }

  return prisma.menuItem.create({
    data: {
      ...data,
      name: item.name,
      categoryId,
      createdById: ownerId,
    },
  });
}

async function seedRestaurant(seed: SeedRestaurant, ownerId: number) {
  const restaurant = await ensureRestaurant(seed, ownerId);
  await ensureOwnerMembership(ownerId, restaurant.id);

  for (const tableNumber of seed.tables) {
    await ensureTable(seed.slug, restaurant.id, tableNumber);
  }

  for (const categorySeed of seed.categories) {
    const category = await ensureCategory(restaurant.id, ownerId, categorySeed.name);

    for (const item of categorySeed.items) {
      await ensureMenuItem(category.id, ownerId, item);
    }
  }

  return restaurant;
}

async function main() {
  const adminUser = await ensureAdminUser();
  const restaurants = [];

  for (const restaurantSeed of RESTAURANTS) {
    restaurants.push(await seedRestaurant(restaurantSeed, adminUser.id));
  }

  console.log("Seed completed");
  console.log(`email: ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`restaurants: ${restaurants.map((restaurant) => restaurant.name).join(", ")}`);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
