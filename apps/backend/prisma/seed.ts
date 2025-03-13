import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminWallet = '0x1234567890123456789012345678901234567890';
  const adminUser = await prisma.user.upsert({
    where: { walletAddress: adminWallet },
    update: {},
    create: {
      walletAddress: adminWallet,
      username: 'Admin',
      email: 'admin@perpetua.ltd',
      role: 'admin',
      bio: 'Perpetua Platform Administrator',
    },
  });
  console.log('Created admin user:', adminUser.username);

  // Create example assets
  const assetsData = [
    {
      name: 'Luxury Villa in Bali',
      type: 'real_estate',
      location: 'Bali, Indonesia',
      description: 'A luxury villa located in the heart of Bali with ocean view.',
      totalValue: 500000,
      availableAmount: 400000,
      minInvestment: 1000,
      expectedReturn: 12.5,
      duration: 60, // 5 years
      imageUrl: 'https://example.com/assets/villa-bali.jpg',
      risk: 'medium',
      status: 'active',
    },
    {
      name: 'Coffee Plantation',
      type: 'agriculture',
      location: 'Costa Rica',
      description: 'Sustainable coffee plantation in the highlands of Costa Rica.',
      totalValue: 250000,
      availableAmount: 200000,
      minInvestment: 500,
      expectedReturn: 8.7,
      duration: 36, // 3 years
      imageUrl: 'https://example.com/assets/coffee-plantation.jpg',
      risk: 'low',
      status: 'active',
    },
    {
      name: 'Solar Farm',
      type: 'renewable_energy',
      location: 'Arizona, USA',
      description: 'Large scale solar energy farm with long-term energy purchase agreements.',
      totalValue: 1000000,
      availableAmount: 750000,
      minInvestment: 2000,
      expectedReturn: 7.2,
      duration: 120, // 10 years
      imageUrl: 'https://example.com/assets/solar-farm.jpg',
      risk: 'low',
      status: 'active',
    },
    {
      name: 'Boutique Hotel',
      type: 'hospitality',
      location: 'Barcelona, Spain',
      description: 'Boutique hotel in the Gothic Quarter of Barcelona with high tourist traffic.',
      totalValue: 750000,
      availableAmount: 600000,
      minInvestment: 1500,
      expectedReturn: 10.8,
      duration: 48, // 4 years
      imageUrl: 'https://example.com/assets/boutique-hotel.jpg',
      risk: 'medium',
      status: 'active',
    },
    {
      name: 'Tech Startup Portfolio',
      type: 'startups',
      location: 'Global',
      description: 'A diversified portfolio of early-stage tech startups across different sectors.',
      totalValue: 500000,
      availableAmount: 450000,
      minInvestment: 5000,
      expectedReturn: 18.5,
      duration: 60, // 5 years
      imageUrl: 'https://example.com/assets/tech-startups.jpg',
      risk: 'high',
      status: 'active',
    },
  ];

  for (const assetData of assetsData) {
    const asset = await prisma.asset.upsert({
      where: { 
        id: `seed-${assetData.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: assetData,
      create: {
        id: `seed-${assetData.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...assetData,
        // Add some performance data
        performances: {
          create: [
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
              value: assetData.totalValue * 0.98,
              growth: 2.1,
              yield: assetData.expectedReturn / 12,
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
              value: assetData.totalValue * 0.96,
              growth: 1.8,
              yield: assetData.expectedReturn / 12,
            },
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
              value: assetData.totalValue * 0.94,
              growth: 1.5,
              yield: assetData.expectedReturn / 12,
            }
          ]
        }
      },
    });
    console.log('Created asset:', asset.name);
  }

  // Create test users
  const usersData = [
    {
      walletAddress: '0x0987654321098765432109876543210987654321',
      username: 'John Doe',
      email: 'john@example.com',
      bio: 'Regular investor interested in real estate and agriculture.',
      role: 'user',
    },
    {
      walletAddress: '0x5555555555555555555555555555555555555555',
      username: 'Alice Smith',
      email: 'alice@example.com',
      bio: 'Professional investor with focus on renewable energy projects.',
      role: 'user',
    }
  ];

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { walletAddress: userData.walletAddress },
      update: userData,
      create: userData,
    });
    console.log('Created user:', user.username);

    // Create referral code for this user
    const referral = await prisma.referral.upsert({
      where: { 
        code: `${user.username.toLowerCase().replace(/\s+/g, '')}-ref`
      },
      update: {},
      create: {
        code: `${user.username.toLowerCase().replace(/\s+/g, '')}-ref`,
        status: 'active',
        referrer: {
          connect: { id: user.id }
        }
      }
    });
    console.log('Created referral code:', referral.code);
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 