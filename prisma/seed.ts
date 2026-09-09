import { PrismaClient, UserRole } from "@prisma/client";

import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin123456";
const DEFAULT_ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Demo Admin";

export type SeedMenuItem = {
  name: string;
  description: string;
  price: string;
  estimatedTime: number;
  isAvailable?: boolean;
  requiresKitchen?: boolean;
};

export type SeedCategory = {
  name: string;
  items: SeedMenuItem[];
};

export type SeedRestaurant = {
  name: string;
  slug: string;
  logoUrl?: string;
  tables: number[];
  categories: SeedCategory[];
};

export const RESTAURANTS: SeedRestaurant[] = [
  {
    name: "Smart Bistro",
    slug: "smart-bistro",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    tables: [1, 2, 3, 4, 5, 6],
    categories: [
      {
        name: "Breakfast",
        items: [
          {
            name: "Avocado Toast with Poached Egg",
            description: "Sourdough toast, avocado, poached egg, microgreens and cherry tomatoes.",
            price: "235.00",
            estimatedTime: 12,
          },
          {
            name: "Cottage Cheese Pancakes",
            description: "Tender cottage cheese pancakes with berry sauce, sour cream and powdered sugar.",
            price: "195.00",
            estimatedTime: 14,
          },
          {
            name: "Salmon Omelette",
            description: "Three eggs, cured salmon, cream cheese and mixed greens.",
            price: "265.00",
            estimatedTime: 13,
          },
        ],
      },
      {
        name: "Main Courses",
        items: [
          {
            name: "Chicken Fillet with Creamy Mash",
            description: "Juicy chicken fillet, potato mash, mushroom sauce and seasonal vegetables.",
            price: "315.00",
            estimatedTime: 22,
          },
          {
            name: "Pasta Carbonara",
            description: "Spaghetti, pancetta, egg yolk, Parmesan and black pepper.",
            price: "285.00",
            estimatedTime: 18,
          },
          {
            name: "Veal Steak",
            description: "Veal steak, roasted potatoes, green beans and pepper sauce.",
            price: "495.00",
            estimatedTime: 28,
          },
        ],
      },
      {
        name: "Desserts",
        items: [
          {
            name: "New York Cheesecake",
            description: "Classic creamy cheesecake with berry compote.",
            price: "165.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Chocolate Fondant",
            description: "Warm chocolate cake with a molten centre and vanilla ice cream.",
            price: "185.00",
            estimatedTime: 12,
          },
        ],
      },
      {
        name: "Drinks",
        items: [
          {
            name: "Cappuccino",
            description: "Espresso with steamed milk foam.",
            price: "85.00",
            estimatedTime: 4,
            requiresKitchen: false,
          },
          {
            name: "Passion Fruit Mint Lemonade",
            description: "House lemonade with passion fruit, lime and fresh mint.",
            price: "125.00",
            estimatedTime: 6,
            requiresKitchen: false,
          },
          {
            name: "Matcha Latte",
            description: "Japanese matcha with your choice of milk.",
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
        name: "Antipasti",
        items: [
          {
            name: "Tomato Bruschetta",
            description: "Toasted ciabatta, tomatoes, basil, garlic and olive oil.",
            price: "155.00",
            estimatedTime: 8,
          },
          {
            name: "Beef Carpaccio",
            description: "Thinly sliced beef, rocket, capers, Parmesan and lemon dressing.",
            price: "295.00",
            estimatedTime: 10,
          },
          {
            name: "Cheese Board",
            description: "A selection of cheeses, nuts, honey and breadsticks.",
            price: "345.00",
            estimatedTime: 7,
            requiresKitchen: false,
          },
        ],
      },
      {
        name: "Pasta",
        items: [
          {
            name: "Tagliatelle Bolognese",
            description: "Fresh pasta with slow-cooked meat ragù, tomatoes and Parmesan.",
            price: "325.00",
            estimatedTime: 20,
          },
          {
            name: "Ricotta and Spinach Ravioli",
            description: "Ravioli in a creamy sage sauce with Parmesan.",
            price: "335.00",
            estimatedTime: 21,
          },
          {
            name: "Prawn Fettuccine",
            description: "Pasta with prawns, garlic, cream, cherry tomatoes and parsley.",
            price: "395.00",
            estimatedTime: 19,
          },
        ],
      },
      {
        name: "Grill",
        items: [
          {
            name: "Ribeye Steak",
            description: "Ribeye steak with demi-glace, potatoes and salad.",
            price: "690.00",
            estimatedTime: 30,
          },
          {
            name: "Grilled Salmon",
            description: "Salmon fillet, asparagus, lemon butter and green salad.",
            price: "520.00",
            estimatedTime: 24,
          },
          {
            name: "Piri-Piri Chicken",
            description: "Marinated chicken with spicy sauce, corn and potatoes.",
            price: "385.00",
            estimatedTime: 26,
          },
        ],
      },
      {
        name: "Bar",
        items: [
          {
            name: "Aperol Spritz",
            description: "Aperol, prosecco, soda water and orange.",
            price: "210.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Espresso Tonic",
            description: "Double espresso, tonic water, ice and citrus.",
            price: "125.00",
            estimatedTime: 5,
            requiresKitchen: false,
          },
          {
            name: "Mineral Water",
            description: "Still or sparkling mineral water, 500 ml.",
            price: "75.00",
            estimatedTime: 2,
            requiresKitchen: false,
          },
        ],
      },
    ],
  },
];

export async function seedDemoData(input: { email: string; password: string; name: string }) {
  const passwordHash = await hashPassword(input.password);

  const adminUser = await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      passwordHash,
      isActive: true,
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash,
      isActive: true,
    },
  });

  const restaurants = [];
  for (const restaurantSeed of RESTAURANTS) {
    restaurants.push(await seedRestaurant(restaurantSeed, adminUser.id));
  }
  return { adminUser, restaurants };
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
  if (process.env.NODE_ENV === "production" && process.env.PUBLIC_DEMO_SEED !== "true") {
    throw new Error("Demo seed is disabled in production unless PUBLIC_DEMO_SEED=true is set by the explicit public demo build.");
  }
  const { restaurants } = await seedDemoData({ email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD, name: DEFAULT_ADMIN_NAME });

  console.log("Seed completed");
  console.log(`email: ${DEFAULT_ADMIN_EMAIL}`);
  console.log(`restaurants: ${restaurants.map((restaurant) => restaurant.name).join(", ")}`);
}

if (process.env.RUN_PRISMA_SEED === "true") {
  main()
    .catch((error) => {
      console.error("Seed failed", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
