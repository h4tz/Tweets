import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const [alice, bob] = await Promise.all([
    prisma.user.upsert({
      where: { username: 'alice' },
      update: {},
      create: { username: 'alice', email: 'alice@example.com', password },
    }),
    prisma.user.upsert({
      where: { username: 'bob' },
      update: {},
      create: { username: 'bob', email: 'bob@example.com', password },
    }),
  ]);

  const tweetCount = await prisma.tweet.count();
  if (tweetCount === 0) {
    const t1 = await prisma.tweet.create({ data: { userId: alice.id, content: 'First tweet from the TS backend!' } });
    const t2 = await prisma.tweet.create({ data: { userId: bob.id, content: 'Bob checking in.' } });

    await prisma.follow.create({ data: { followerId: alice.id, followedId: bob.id } });
    await prisma.like.create({ data: { userId: alice.id, tweetId: t2.id } });
    await prisma.comment.create({
      data: { userId: bob.id, tweetId: t1.id, content: 'Welcome to the new backend!' },
    });
  }

  console.log('Seed complete. Users: alice / bob (password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
