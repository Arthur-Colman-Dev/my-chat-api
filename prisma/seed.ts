import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const arthur = await prisma.user.upsert({
    where: { id: 'user_dev_01' },
    update: {},
    create: { id: 'user_dev_01', displayName: 'Arthur Eng' },
  });
  console.log('Seeded user:', arthur);
}
void main().finally(() => prisma.$disconnect());
