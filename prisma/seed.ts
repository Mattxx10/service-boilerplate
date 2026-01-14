import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create base permissions
  const permissions = await Promise.all([
    // Users
    prisma.permission.create({ data: { key: 'users.read', description: 'Read user information' } }),
    prisma.permission.create({ data: { key: 'users.write', description: 'Create and update users' } }),
    prisma.permission.create({ data: { key: 'users.delete', description: 'Delete users' } }),
    
    // Organizations
    prisma.permission.create({ data: { key: 'organizations.read', description: 'Read organization information' } }),
    prisma.permission.create({ data: { key: 'organizations.write', description: 'Create and update organizations' } }),
    prisma.permission.create({ data: { key: 'organizations.delete', description: 'Delete organizations' } }),
    
    // Memberships
    prisma.permission.create({ data: { key: 'memberships.read', description: 'Read membership information' } }),
    prisma.permission.create({ data: { key: 'memberships.write', description: 'Manage memberships' } }),
    prisma.permission.create({ data: { key: 'memberships.delete', description: 'Remove memberships' } }),
    
    // Roles
    prisma.permission.create({ data: { key: 'roles.read', description: 'Read role information' } }),
    prisma.permission.create({ data: { key: 'roles.write', description: 'Create and update roles' } }),
    prisma.permission.create({ data: { key: 'roles.delete', description: 'Delete roles' } }),
    
    // Billing
    prisma.permission.create({ data: { key: 'billing.read', description: 'Read billing information' } }),
    prisma.permission.create({ data: { key: 'billing.write', description: 'Manage billing' } }),
    prisma.permission.create({ data: { key: 'billing.invoice.create', description: 'Create invoices' } }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create a test organization
  const org = await prisma.organization.create({
    data: {
      name: 'Test Organization',
    },
  });

  console.log(`✅ Created organization: ${org.name}`);

  // Create admin role with all permissions
  const adminRole = await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'admin',
      description: 'Full access to all resources',
      permissions: {
        create: permissions.map(p => ({ permissionId: p.id })),
      },
    },
  });

  console.log(`✅ Created admin role with ${permissions.length} permissions`);

  // Create member role with limited permissions
  await prisma.role.create({
    data: {
      organizationId: org.id,
      name: 'member',
      description: 'Basic member access',
      permissions: {
        create: [
          { permissionId: permissions.find(p => p.key === 'users.read')!.id },
          { permissionId: permissions.find(p => p.key === 'organizations.read')!.id },
          { permissionId: permissions.find(p => p.key === 'memberships.read')!.id },
        ],
      },
    },
  });

  console.log(`✅ Created member role`);

  // Create membership for the user
  await prisma.membership.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      roleId: adminRole.id,
    },
  });

  console.log(`✅ Created membership for ${user.email} in ${org.name} as admin`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
