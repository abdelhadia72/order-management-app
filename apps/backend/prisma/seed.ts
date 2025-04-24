import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log(`Starting database seeding...`);
  const saltRounds = 10;

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Existing data deleted.');

  // USERS
  console.log('Creating users...');

  // Admin user
  const adminPassword = await bcrypt.hash('juma123', saltRounds);
  const admin = await prisma.user.create({
    data: {
      email: 'juma@jumatech.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      address: '123 Admin Street, Adminville',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  // Regular user 1
  const user1Password = await bcrypt.hash('password123', saltRounds);
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      password: user1Password,
      role: 'user',
      address: '456 User Lane, Usertown',
    },
  });
  console.log(`Created user: ${user1.email}`);

  // Regular user 2
  const user2Password = await bcrypt.hash('password123', saltRounds);
  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: user2Password,
      role: 'user',
      address: '789 Customer Road, Clientville',
    },
  });
  console.log(`Created user: ${user2.email}`);

  // PRODUCTS
  console.log('Creating products...');

  // Admin products
  const adminProducts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Premium Laptop',
        description: 'High-end laptop with the latest specifications',
        price: 1299.99,
        stock: 15,
        userId: admin.userId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Office Chair',
        description: 'Comfortable chair with lumbar support',
        price: 249.99,
        stock: 30,
        userId: admin.userId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones',
        price: 179.99,
        stock: 50,
        userId: admin.userId,
      },
    }),
  ]);
  console.log(`Created ${adminProducts.length} products for admin`);

  // User 1 products
  const user1Products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Case',
        description: 'Protective case for popular smartphone models',
        price: 19.99,
        stock: 100,
        userId: user1.userId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Wireless Charging Pad',
        description: 'Fast wireless charging for compatible devices',
        price: 39.99,
        stock: 45,
        userId: user1.userId,
      },
    }),
  ]);
  console.log(`Created ${user1Products.length} products for ${user1.name}`);

  // User 2 products
  const user2Products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smart Watch',
        description: 'Fitness tracker and smartwatch with health monitoring',
        price: 199.99,
        stock: 25,
        userId: user2.userId,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Bluetooth Speaker',
        description: 'Portable speaker with 20-hour battery life',
        price: 89.99,
        stock: 35,
        userId: user2.userId,
      },
    }),
  ]);
  console.log(`Created ${user2Products.length} products for ${user2.name}`);

  // ORDERS
  console.log('Creating orders...');

  // User 1 orders
  const user1Order = await prisma.order.create({
    data: {
      status: 'COMPLETED',
      userId: user1.userId,
      orderItems: {
        create: [
          {
            productId: adminProducts[0].productId, // Premium Laptop
            quantity: 1,
          },
          {
            productId: adminProducts[2].productId, // Wireless Headphones
            quantity: 2,
          },
        ],
      },
    },
    include: {
      orderItems: true,
    },
  });
  console.log(
    `Created order for ${user1.name} with ${user1Order.orderItems.length} items`,
  );

  // User 2 orders
  const user2Order1 = await prisma.order.create({
    data: {
      status: 'PENDING',
      userId: user2.userId,
      orderItems: {
        create: [
          {
            productId: adminProducts[1].productId, // Ergonomic Office Chair
            quantity: 1,
          },
        ],
      },
    },
    include: {
      orderItems: true,
    },
  });

  const user2Order2 = await prisma.order.create({
    data: {
      status: 'PROCESSING',
      userId: user2.userId,
      orderItems: {
        create: [
          {
            productId: user1Products[0].productId, // Smartphone Case
            quantity: 3,
          },
          {
            productId: user1Products[1].productId, // Wireless Charging Pad
            quantity: 1,
          },
        ],
      },
    },
    include: {
      orderItems: true,
    },
  });
  console.log(`Created ${2} orders for ${user2.name}`);

  // Admin orders
  const adminOrder = await prisma.order.create({
    data: {
      status: 'COMPLETED',
      userId: admin.userId,
      orderItems: {
        create: [
          {
            productId: user2Products[0].productId, // Smart Watch
            quantity: 1,
          },
          {
            productId: user2Products[1].productId, // Bluetooth Speaker
            quantity: 1,
          },
        ],
      },
    },
    include: {
      orderItems: true,
    },
  });
  console.log(
    `Created order for admin with ${adminOrder.orderItems.length} items`,
  );

  console.log(`Database seeding completed successfully!`);
  console.log(`
  Created:
  - 3 users (1 admin, 2 regular users)
  - 7 products
  - 4 orders with multiple order items
  `);
}

main()
  .catch((e) => {
    console.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
