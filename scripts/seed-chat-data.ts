import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChatData() {
  console.log('🌱 Seeding chat data...');

  try {
    // Find or create a default employee
    let defaultEmployee = await prisma.employee.findFirst({
      where: { email: 'admin@example.com' }
    });

    if (!defaultEmployee) {
      // Create default role and department if they don't exist
      let adminRole = await prisma.role.findFirst({
        where: { name: 'ADMIN' }
      });

      if (!adminRole) {
        adminRole = await prisma.role.create({
          data: {
            name: 'ADMIN'
          }
        });
      }

      let generalDept = await prisma.department.findFirst({
        where: { name: 'General' }
      });

      if (!generalDept) {
        generalDept = await prisma.department.create({
          data: {
            name: 'General',
            description: 'General department'
          }
        });
      }

      defaultEmployee = await prisma.employee.create({
        data: {
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Admin',
          departmentId: generalDept.id
        }
      });
    }

    // Create default chat channels
    const channels = [
      {
        name: 'général',
        description: 'Canal général pour toute l\'équipe',
        type: 'GENERAL',
        isPrivate: false
      },
      {
        name: 'annonces',
        description: 'Annonces importantes de l\'entreprise',
        type: 'ANNOUNCEMENT',
        isPrivate: false
      },
      {
        name: 'développement',
        description: 'Discussions techniques et développement',
        type: 'TEAM',
        isPrivate: false
      },
      {
        name: 'projets',
        description: 'Coordination des projets en cours',
        type: 'PROJECT',
        isPrivate: false
      },
      {
        name: 'support',
        description: 'Canal d\'aide et support technique',
        type: 'TEAM',
        isPrivate: false
      }
    ];

    for (const channelData of channels) {
      const existingChannel = await prisma.chatChannel.findFirst({
        where: { name: channelData.name }
      });

      if (!existingChannel) {
        const channel = await prisma.chatChannel.create({
          data: {
            ...channelData,
            type: channelData.type as any,
            createdBy: defaultEmployee.id
          }
        });

        // Add creator as admin member
        await prisma.chatChannelMember.create({
          data: {
            channelId: channel.id,
            employeeId: defaultEmployee.id,
            role: 'ADMIN'
          }
        });

        console.log(`✅ Created channel: ${channel.name}`);
      } else {
        console.log(`ℹ️  Channel already exists: ${channelData.name}`);
      }
    }

    // Add sample messages to general channel
    const generalChannel = await prisma.chatChannel.findFirst({
      where: { name: 'général' }
    });

    if (generalChannel) {
      const existingMessages = await prisma.chatChannelMessage.count({
        where: { channelId: generalChannel.id }
      });

      if (existingMessages === 0) {
        const sampleMessages = [
          {
            content: 'Bienvenue dans le canal général ! 👋',
            messageType: 'TEXT'
          },
          {
            content: 'Ce canal est parfait pour les discussions générales de l\'équipe.',
            messageType: 'TEXT'
          },
          {
            content: 'N\'hésitez pas à partager vos idées et questions ici ! 💡',
            messageType: 'TEXT'
          }
        ];

        for (const messageData of sampleMessages) {
          await prisma.chatChannelMessage.create({
            data: {
              ...messageData,
              messageType: messageData.messageType as any,
              channelId: generalChannel.id,
              senderId: defaultEmployee.id
            }
          });
        }

        console.log('✅ Added sample messages to general channel');
      }
    }

    console.log('🎉 Chat data seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding chat data:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedChatData();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export default seedChatData;
