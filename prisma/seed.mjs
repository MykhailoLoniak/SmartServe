import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'gastro-point' },
    update: {
      name: 'Gastro Point',
      logoUrl:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    },
    create: {
      name: 'Gastro Point',
      slug: 'gastro-point',
      logoUrl:
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const tables = [
    { number: 1, qrSlug: 'gastro-point-t1' },
    { number: 2, qrSlug: 'gastro-point-t2' },
    { number: 3, qrSlug: 'gastro-point-t3' },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { qrSlug: table.qrSlug },
      update: {
        number: table.number,
        restaurantId: restaurant.id,
      },
      create: {
        number: table.number,
        qrSlug: table.qrSlug,
        restaurantId: restaurant.id,
      },
    });
  }

  const burgersCategory = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Бургери',
      },
    },
    update: {},
    create: {
      name: 'Бургери',
      restaurantId: restaurant.id,
    },
  });

  const drinksCategory = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: 'Напої',
      },
    },
    update: {},
    create: {
      name: 'Напої',
      restaurantId: restaurant.id,
    },
  });

  await prisma.menuItem.deleteMany({
    where: { categoryId: { in: [burgersCategory.id, drinksCategory.id] } },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Класичний бургер',
        description: 'Яловичина, сир чеддер, салат, томат і фірмовий соус.',
        price: '189.00',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
        categoryId: burgersCategory.id,
      },
      {
        name: 'BBQ Бургер',
        description: 'Соковита котлета, бекон, карамелізована цибуля та BBQ соус.',
        price: '219.00',
        imageUrl:
          'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
        categoryId: burgersCategory.id,
      },
      {
        name: 'Подвійний чизбургер',
        description: 'Подвійна яловичина, подвійний сир, маринований огірок.',
        price: '249.00',
        imageUrl:
          'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=1200&q=80',
        categoryId: burgersCategory.id,
      },
      {
        name: 'Лимонад маракуя',
        description: 'Освіжаючий домашній лимонад із маракуєю.',
        price: '95.00',
        imageUrl:
          'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=1200&q=80',
        categoryId: drinksCategory.id,
      },
      {
        name: 'Айс латте',
        description: 'Холодна кава з молоком і льодом.',
        price: '110.00',
        imageUrl:
          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80',
        categoryId: drinksCategory.id,
      },
      {
        name: 'Апельсиновий фреш',
        description: 'Свіжовичавлений апельсиновий сік.',
        price: '120.00',
        imageUrl:
          'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80',
        categoryId: drinksCategory.id,
      },
    ],
  });

  console.log('Seed completed for restaurant: Gastro Point');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
