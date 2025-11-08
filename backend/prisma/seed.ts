import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create users
  const adminPassword = await hashPassword('Admin@123');
  const managerPassword = await hashPassword('Manager@123');
  const salesPassword = await hashPassword('Sales@123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      email: 'manager@crm.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      phone: '+1234567891',
      isActive: true,
    },
  });

  const sales1 = await prisma.user.upsert({
    where: { email: 'sales1@crm.com' },
    update: {},
    create: {
      email: 'sales1@crm.com',
      password: salesPassword,
      firstName: 'John',
      lastName: 'Sales',
      role: 'SALES_EXECUTIVE',
      phone: '+1234567892',
      isActive: true,
    },
  });

  const sales2 = await prisma.user.upsert({
    where: { email: 'sales2@crm.com' },
    update: {},
    create: {
      email: 'sales2@crm.com',
      password: salesPassword,
      firstName: 'Jane',
      lastName: 'Sales',
      role: 'SALES_EXECUTIVE',
      phone: '+1234567893',
      isActive: true,
    },
  });

  console.log('Users created:', { admin, manager, sales1, sales2 });

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@techcorp.com',
        phone: '+1555100001',
        company: 'TechCorp Solutions',
        position: 'CTO',
        status: 'QUALIFIED',
        source: 'Website',
        value: 50000,
        priority: 'HIGH',
        description: 'Interested in enterprise CRM solution',
        tags: ['enterprise', 'technology', 'high-value'],
        ownerId: sales1.id,
        createdById: sales1.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@startupinc.com',
        phone: '+1555100002',
        company: 'Startup Inc',
        position: 'CEO',
        status: 'PROPOSAL',
        source: 'Referral',
        value: 25000,
        priority: 'MEDIUM',
        description: 'Looking for scalable CRM for growing startup',
        tags: ['startup', 'scalability'],
        ownerId: sales2.id,
        createdById: manager.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@retailco.com',
        phone: '+1555100003',
        company: 'RetailCo',
        position: 'Sales Director',
        status: 'CONTACTED',
        source: 'Cold Call',
        value: 15000,
        priority: 'LOW',
        description: 'Exploring CRM options for retail business',
        tags: ['retail', 'small-business'],
        ownerId: sales1.id,
        createdById: sales1.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@financeplus.com',
        phone: '+1555100004',
        company: 'FinancePlus',
        position: 'Operations Manager',
        status: 'NEW',
        source: 'LinkedIn',
        value: 35000,
        priority: 'URGENT',
        description: 'Urgent need for CRM to manage client relationships',
        tags: ['finance', 'urgent', 'enterprise'],
        ownerId: sales2.id,
        createdById: sales2.id,
      },
    }),
    prisma.lead.create({
      data: {
        firstName: 'Robert',
        lastName: 'Martinez',
        email: 'robert.martinez@healthsys.com',
        phone: '+1555100005',
        company: 'HealthSys',
        position: 'IT Manager',
        status: 'WON',
        source: 'Conference',
        value: 75000,
        priority: 'HIGH',
        description: 'Successfully closed - implementing healthcare CRM',
        tags: ['healthcare', 'enterprise', 'won'],
        ownerId: sales1.id,
        createdById: sales1.id,
      },
    }),
  ]);

  console.log(`Created ${leads.length} sample leads`);

  // Create activities for leads
  for (const lead of leads) {
    await prisma.activity.create({
      data: {
        type: 'NOTE',
        subject: 'Initial contact',
        description: 'Made first contact with the lead',
        leadId: lead.id,
        userId: lead.ownerId,
      },
    });

    if (lead.status !== 'NEW') {
      await prisma.activity.create({
        data: {
          type: 'CALL',
          subject: 'Discovery call',
          description: 'Discussed requirements and use cases',
          duration: 30,
          outcome: 'Positive - interested in our solution',
          leadId: lead.id,
          userId: lead.ownerId,
        },
      });
    }
  }

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with TechCorp',
        description: 'Send proposal document and pricing',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        leadId: leads[0].id,
        assignedTo: sales1.id,
        createdById: manager.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Schedule demo for Startup Inc',
        description: 'Set up product demonstration meeting',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        leadId: leads[1].id,
        assignedTo: sales2.id,
        createdById: sales2.id,
      },
    }),
  ]);

  console.log('Sample tasks created');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        type: 'LEAD_ASSIGNED',
        title: 'New lead assigned',
        message: 'A new high-priority lead has been assigned to you',
        userId: sales1.id,
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        type: 'TASK_DUE',
        title: 'Task due soon',
        message: 'Your task "Follow up with TechCorp" is due in 2 days',
        userId: sales1.id,
        isRead: false,
      },
    }),
  ]);

  console.log('Notifications created');
  console.log('✅ Database seeding completed successfully!');
  console.log('\nTest accounts:');
  console.log('- Admin: admin@crm.com / Admin@123');
  console.log('- Manager: manager@crm.com / Manager@123');
  console.log('- Sales 1: sales1@crm.com / Sales@123');
  console.log('- Sales 2: sales2@crm.com / Sales@123');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
