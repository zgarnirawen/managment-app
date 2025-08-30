import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChatData() {
  try {
    // Create General channel if it doesn't exist
    const generalChannel = await prisma.chatChannel.upsert({
      where: { id: 'general-channel' },
      update: {},
      create: {
        id: 'general-channel',
        name: 'General',
        description: 'General discussions for all team members',
        type: 'GENERAL',
        isPrivate: false,
        createdBy: 'admin-user-id', // This should be replaced with actual admin ID
      },
    });

    // Create Team channel
    const teamChannel = await prisma.chatChannel.upsert({
      where: { id: 'team-channel' },
      update: {},
      create: {
        id: 'team-channel',
        name: 'Team Updates',
        description: 'Team announcements and updates',
        type: 'TEAM',
        isPrivate: false,
        createdBy: 'admin-user-id', // This should be replaced with actual admin ID
      },
    });

    // Create Intern channel
    const internChannel = await prisma.chatChannel.upsert({
      where: { id: 'intern-channel' },
      update: {},
      create: {
        id: 'intern-channel',
        name: 'Intern Hub',
        description: 'Space for interns to connect and collaborate',
        type: 'INTERN',
        isPrivate: false,
        createdBy: 'admin-user-id', // This should be replaced with actual admin ID
      },
    });

    console.log('✅ Chat seed data created successfully!');
    console.log('Created channels:', {
      general: generalChannel.id,
      team: teamChannel.id,
      intern: internChannel.id,
    });

  } catch (error) {
    console.error('Error seeding chat data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedChatData();
