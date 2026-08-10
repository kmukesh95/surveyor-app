import { prisma } from './prisma';

const stateList = [
  { id: 1, stateCode: '01', stateName: 'JAMMU AND KASHMIR' },
  { id: 2, stateCode: '02', stateName: 'HIMACHAL PRADESH' },
  { id: 3, stateCode: '03', stateName: 'PUNJAB' },
  { id: 4, stateCode: '04', stateName: 'CHANDIGARH' },
  { id: 5, stateCode: '05', stateName: 'UTTARAKHAND' },
  { id: 6, stateCode: '06', stateName: 'HARYANA' },
  { id: 7, stateCode: '07', stateName: 'DELHI' },
  { id: 8, stateCode: '08', stateName: 'RAJASTHAN' },
  { id: 9, stateCode: '09', stateName: 'UTTAR PRADESH' },
  { id: 10, stateCode: '10', stateName: 'BIHAR' },
  { id: 11, stateCode: '11', stateName: 'SIKKIM' },
  { id: 12, stateCode: '12', stateName: 'ARUNACHAL PRADESH' },
  { id: 13, stateCode: '13', stateName: 'NAGALAND' },
  { id: 14, stateCode: '14', stateName: 'MANIPUR' },
  { id: 15, stateCode: '15', stateName: 'MIZORAM' },
  { id: 16, stateCode: '16', stateName: 'TRIPURA' },
  { id: 17, stateCode: '17', stateName: 'MEGHALAYA' },
  { id: 18, stateCode: '18', stateName: 'ASSAM' },
  { id: 19, stateCode: '19', stateName: 'WEST BENGAL' },
  { id: 20, stateCode: '20', stateName: 'JHARKHAND' },
  { id: 21, stateCode: '21', stateName: 'ORISSA' },
  { id: 22, stateCode: '22', stateName: 'CHHATTISGARH' },
  { id: 23, stateCode: '23', stateName: 'MADHYA PRADESH' },
  { id: 24, stateCode: '24', stateName: 'GUJARAT' },
  { id: 26, stateCode: '26', stateName: 'DADRA AND NAGAR HAVELI & DAMAN AND DIU' },
  { id: 27, stateCode: '27', stateName: 'MAHARASHTRA' },
  { id: 29, stateCode: '29', stateName: 'KARNATAKA' },
  { id: 30, stateCode: '30', stateName: 'GOA' },
  { id: 31, stateCode: '31', stateName: 'LAKSHADWEEP' },
  { id: 32, stateCode: '32', stateName: 'KERALA' },
  { id: 33, stateCode: '33', stateName: 'TAMIL NADU' },
  { id: 34, stateCode: '34', stateName: 'PUDUCHERRY' },
  { id: 35, stateCode: '35', stateName: 'ANDAMAN AND NICOBAR' },
  { id: 36, stateCode: '36', stateName: 'TELANGANA' },
  { id: 37, stateCode: '37', stateName: 'ANDHRA PRADESH' },
  { id: 38, stateCode: '38', stateName: 'LADAKH' },
];

async function seed() {
  console.log('🌱 Starting Master Tables Seeding...');

  // 1. Seed Master Roles
  const roles = [
    { roleCode: 'SUPER_ADMIN', roleName: 'Super Administrator', description: 'Full system control & configuration' },
    { roleCode: 'ADMIN', roleName: 'Administrator', description: 'System admin managing surveyors and beneficiaries' },
    { roleCode: 'CMS_USER', roleName: 'CMS User', description: 'Content and survey module manager' },
    { roleCode: 'SURVEYOR', roleName: 'Field Surveyor', description: 'Field agent conducting household surveys' },
    { roleCode: 'BENEFICIARY', roleName: 'Beneficiary (Head of Household)', description: 'Primary household user' },
  ];

  for (const role of roles) {
    await prisma.masterRole.upsert({
      where: { roleCode: role.roleCode },
      update: { roleName: role.roleName, description: role.description },
      create: role,
    });
  }
  console.log('✅ Master Roles seeded.');

  // 2. Seed Master Relations
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
    await prisma.masterRelation.upsert({
      where: { relationCode: rel.relationCode },
      update: { relationName: rel.relationName },
      create: rel,
    });
  }
  console.log('✅ Master Relations seeded.');

  // 3. Seed Master Qualifications
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
    await prisma.masterQualification.upsert({
      where: { qualificationCode: qual.qualificationCode },
      update: { qualificationName: qual.qualificationName },
      create: qual,
    });
  }
  console.log('✅ Master Qualifications seeded.');

  // 4. Seed Master Social Categories
  const categories = [
    { categoryCode: 'GENERAL', categoryName: 'General (UR)' },
    { categoryCode: 'OBC', categoryName: 'Other Backward Class (OBC)' },
    { categoryCode: 'SC', categoryName: 'Scheduled Caste (SC)' },
    { categoryCode: 'ST', categoryName: 'Scheduled Tribe (ST)' },
    { categoryCode: 'EWS', categoryName: 'Economically Weaker Section (EWS)' },
  ];

  for (const cat of categories) {
    await prisma.masterSocialCategory.upsert({
      where: { categoryCode: cat.categoryCode },
      update: { categoryName: cat.categoryName },
      create: cat,
    });
  }
  console.log('✅ Master Social Categories seeded.');

  // 5. Insert Master States with stateCode format "01", "02", ...
  for (const s of stateList) {
    await prisma.masterState.upsert({
      where: { id: s.id },
      update: {
        stateCode: s.stateCode,
        stateName: s.stateName,
        isActive: true,
        isDeleted: false,
      },
      create: {
        id: s.id,
        stateCode: s.stateCode,
        stateName: s.stateName,
        isActive: true,
        isDeleted: false,
      },
    });
  }

  try {
    await prisma.$executeRawUnsafe(`SELECT setval('master_states_id_seq', 40, true);`);
  } catch (err) {}

  console.log('✅ 36 Master States seeded with clean codes ("01", "02", ...).');
  console.log('🎉 Seeding Completed Successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
