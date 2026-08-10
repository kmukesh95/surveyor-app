import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function truncateAndSeed() {
  console.log('🧹 Truncating all PostgreSQL tables with RESTART IDENTITY CASCADE...');

  // 1. Truncate all tables in public schema with RESTART IDENTITY CASCADE
  const tables = [
    'user_locations',
    'beneficiary_documents',
    'media',
    'beneficiary_family_members',
    'beneficiary_qualifications',
    'beneficiary_addresses',
    'beneficiary_details',
    'users',
    'master_blocks',
    'master_districts',
    'master_states',
    'master_social_categories',
    'master_qualifications',
    'master_relations',
    'master_roles',
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${table}" RESTART IDENTITY CASCADE;`);
      console.log(`  ✓ Truncated ${table}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Could not truncate ${table}: ${err.message}`);
    }
  }

  console.log('\n🌱 Starting Fresh Master Seeding...');

  // 2. Seed Master Roles
  const roles = [
    { roleCode: 'SUPER_ADMIN', roleName: 'Super Administrator', description: 'Full system control & configuration' },
    { roleCode: 'ADMIN', roleName: 'Administrator', description: 'System admin managing surveyors and beneficiaries' },
    { roleCode: 'CMS_USER', roleName: 'CMS User', description: 'Content and survey module manager' },
    { roleCode: 'SURVEYOR', roleName: 'Field Surveyor', description: 'Field agent conducting household surveys' },
    { roleCode: 'BENEFICIARY', roleName: 'Beneficiary (Head of Household)', description: 'Primary household user' },
  ];

  for (const role of roles) {
    await prisma.masterRole.create({ data: role });
  }
  console.log('✅ Master Roles seeded.');

  // 3. Seed Master Relations
  const relations = [
    { relationCode: 'HEAD_OF_FAMILY', relationName: 'Head of Family' },
    { relationCode: 'SPOUSE', relationName: 'Spouse (Husband/Wife)' },
    { relationCode: 'SON', relationName: 'Son' },
    { relationCode: 'DAUGHTER', relationName: 'Daughter' },
    { relationCode: 'FATHER', relationName: 'Father' },
    { relationCode: 'MOTHER', relationName: 'Mother' },
    { relationCode: 'BROTHER', relationName: 'Brother' },
    { relationCode: 'SISTER', relationName: 'Sister' },
    { relationCode: 'GRANDFATHER', relationName: 'Grandfather' },
    { relationCode: 'GRANDMOTHER', relationName: 'Grandmother' },
    { relationCode: 'OTHER_DEPENDENT', relationName: 'Other Dependent' },
  ];

  for (const rel of relations) {
    await prisma.masterRelation.create({ data: rel });
  }
  console.log('✅ Master Relations seeded.');

  // 4. Seed Master Qualifications
  const qualifications = [
    { qualificationCode: 'NON_FORMAL', qualificationName: 'Non-Formal Education' },
    { qualificationCode: 'PRIMARY_SCHOOL', qualificationName: 'Primary School (Class 1-5)' },
    { qualificationCode: 'MIDDLE_SCHOOL', qualificationName: 'Middle School (Class 6-8)' },
    { qualificationCode: '10TH', qualificationName: 'High School (10th Pass)' },
    { qualificationCode: '12TH', qualificationName: 'Higher Secondary (12th Pass)' },
    { qualificationCode: 'DIPLOMA', qualificationName: 'Polytechnic / ITI Diploma' },
    { qualificationCode: 'GRADUATE', qualificationName: 'Bachelor Degree (Graduation)' },
    { qualificationCode: 'POST_GRADUATE', qualificationName: 'Master Degree (Post Graduation)' },
    { qualificationCode: 'DOCTORATE', qualificationName: 'Doctorate / PhD' },
  ];

  for (const qual of qualifications) {
    await prisma.masterQualification.create({ data: qual });
  }
  console.log('✅ Master Qualifications seeded.');

  // 5. Seed Master Social Categories
  const categories = [
    { categoryCode: 'GENERAL', categoryName: 'General (UR)' },
    { categoryCode: 'OBC', categoryName: 'Other Backward Class (OBC)' },
    { categoryCode: 'SC', categoryName: 'Scheduled Caste (SC)' },
    { categoryCode: 'ST', categoryName: 'Scheduled Tribe (ST)' },
    { categoryCode: 'EWS', categoryName: 'Economically Weaker Section (EWS)' },
  ];

  for (const cat of categories) {
    await prisma.masterSocialCategory.create({ data: cat });
  }
  console.log('✅ Master Social Categories seeded.');

  // 6. Seed Master State, District, Block
  const defaultState = await prisma.masterState.create({
    data: { stateCode: 'ST_DELHI', stateName: 'Delhi' },
  });

  const defaultDistrict = await prisma.masterDistrict.create({
    data: {
      districtCode: 'DIS_CENTRAL_DELHI',
      districtName: 'Central Delhi',
      stateId: defaultState.id,
    },
  });

  const defaultBlock = await prisma.masterBlock.create({
    data: {
      blockCode: 'BLK_CIVIL_LINES',
      blockName: 'Civil Lines',
      districtId: defaultDistrict.id,
    },
  });
  console.log('✅ Master States, Districts & Blocks seeded.');

  // 7. Seed Default Admin User (Mobile: 9999999999, Pass: password123)
  const adminRole = await prisma.masterRole.findFirst({ where: { roleCode: 'ADMIN' } });
  if (adminRole) {
    const passwordHash = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        mobile: '9999999999',
        email: 'admin@surveyor.com',
        gender: 'MALE',
        registrationType: 'DIRECT',
        roleId: adminRole.id,
        passwordHash,
      },
    });

    // Map Zonal Location for Admin User
    await prisma.userLocation.create({
      data: {
        userId: adminUser.id,
        stateId: defaultState.id,
        districtId: defaultDistrict.id,
        blockId: defaultBlock.id,
      },
    });

    console.log('✅ Default System Administrator Created:');
    console.log('   Mobile: 9999999999');
    console.log('   Password: password123');
    console.log('   Role: ADMIN');
    console.log('   Location: Delhi -> Central Delhi -> Civil Lines');
  }

  console.log('\n🎉 ALL TABLES TRUNCATED & RE-SEEDED FRESH SUCCESSFULLY!');
}

truncateAndSeed()
  .catch((e) => {
    console.error('❌ Truncate/Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
