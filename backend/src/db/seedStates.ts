import { prisma } from './prisma';

const stateList = [
  { id: 1, code: 'ST_01', name: 'JAMMU AND KASHMIR', district: 'Srinagar', block: 'City Center' },
  { id: 2, code: 'ST_02', name: 'HIMACHAL PRADESH', district: 'Shimla', block: 'Urban Block' },
  { id: 3, code: 'ST_03', name: 'PUNJAB', district: 'Amritsar', block: 'Ajnala' },
  { id: 4, code: 'ST_04', name: 'CHANDIGARH', district: 'Chandigarh', block: 'Sector 17' },
  { id: 5, code: 'ST_05', name: 'UTTARAKHAND', district: 'Dehradun', block: 'Mussoorie' },
  { id: 6, code: 'ST_06', name: 'HARYANA', district: 'Gurugram', block: 'Badshahpur' },
  { id: 7, code: 'ST_07', name: 'DELHI', district: 'Central Delhi', block: 'Civil Lines' },
  { id: 8, code: 'ST_08', name: 'RAJASTHAN', district: 'Jaipur', block: 'Sanganer' },
  { id: 9, code: 'ST_09', name: 'UTTAR PRADESH', district: 'Lucknow', block: 'Hazratganj' },
  { id: 10, code: 'ST_10', name: 'BIHAR', district: 'Patna', block: 'Danapur' },
  { id: 11, code: 'ST_11', name: 'SIKKIM', district: 'Gangtok', block: 'East Sikkim' },
  { id: 12, code: 'ST_12', name: 'ARUNACHAL PRADESH', district: 'Itanagar', block: 'Capital Block' },
  { id: 13, code: 'ST_13', name: 'NAGALAND', district: 'Kohima', block: 'Town Block' },
  { id: 14, code: 'ST_14', name: 'MANIPUR', district: 'Imphal', block: 'East Imphal' },
  { id: 15, code: 'ST_15', name: 'MIZORAM', district: 'Aizawl', block: 'Central Aizawl' },
  { id: 16, code: 'ST_16', name: 'TRIPURA', district: 'Agartala', block: 'West Tripura' },
  { id: 17, code: 'ST_17', name: 'MEGHALAYA', district: 'Shillong', block: 'Mylliem' },
  { id: 18, code: 'ST_18', name: 'ASSAM', district: 'Guwahati', block: 'Kamrup Metro' },
  { id: 19, code: 'ST_19', name: 'WEST BENGAL', district: 'Kolkata', block: 'Central Kolkata' },
  { id: 20, code: 'ST_20', name: 'JHARKHAND', district: 'Ranchi', block: 'Town Block' },
  { id: 21, code: 'ST_21', name: 'ORISSA', district: 'Bhubaneswar', block: 'Khordha Block' },
  { id: 22, code: 'ST_22', name: 'CHHATTISGARH', district: 'Raipur', block: 'City Block' },
  { id: 23, code: 'ST_23', name: 'MADHYA PRADESH', district: 'Bhopal', block: 'Huzur' },
  { id: 24, code: 'ST_24', name: 'GUJARAT', district: 'Ahmedabad', block: 'City Block' },
  { id: 26, code: 'ST_26', name: 'DADRA AND NAGAR HAVELI & DAMAN AND DIU', district: 'Daman', block: 'Urban Daman' },
  { id: 27, code: 'ST_27', name: 'MAHARASHTRA', district: 'Mumbai City', block: 'Colaba' },
  { id: 29, code: 'ST_29', name: 'KARNATAKA', district: 'Bengaluru Urban', block: 'North Block' },
  { id: 30, code: 'ST_30', name: 'GOA', district: 'North Goa', block: 'Panaji' },
  { id: 31, code: 'ST_31', name: 'LAKSHADWEEP', district: 'Kavaratti', block: 'Main Island' },
  { id: 32, code: 'ST_32', name: 'KERALA', district: 'Thiruvananthapuram', block: 'City Zone' },
  { id: 33, code: 'ST_33', name: 'TAMIL NADU', district: 'Chennai', block: 'Egmore' },
  { id: 34, code: 'ST_34', name: 'PUDUCHERRY', district: 'Puducherry', block: 'Town Block' },
  { id: 35, code: 'ST_35', name: 'ANDAMAN AND NICOBAR', district: 'Port Blair', block: 'South Andaman' },
  { id: 36, code: 'ST_36', name: 'TELANGANA', district: 'Hyderabad', block: 'Charminar' },
  { id: 37, code: 'ST_37', name: 'ANDHRA PRADESH', district: 'Visakhapatnam', block: 'Gajuwaka' },
  { id: 38, code: 'ST_38', name: 'LADAKH', district: 'Leh', block: 'Leh Town' },
];

async function seedAllStates() {
  console.log('🏛️ Seeding 36 Official Indian States/UTs into master_states table...');

  for (const s of stateList) {
    // 1. Upsert State
    const stateRecord = await prisma.masterState.upsert({
      where: { id: s.id },
      update: {
        stateCode: s.code,
        stateName: s.name,
        isActive: true,
        isDeleted: false,
      },
      create: {
        id: s.id,
        stateCode: s.code,
        stateName: s.name,
        isActive: true,
        isDeleted: false,
      },
    });

    // 2. Upsert default District for this State
    const districtCode = `DIS_${s.code}_${s.district.toUpperCase().replace(/\s+/g, '_')}`;
    const districtRecord = await prisma.masterDistrict.upsert({
      where: { districtCode },
      update: {
        districtName: s.district,
        stateId: stateRecord.id,
        isActive: true,
        isDeleted: false,
      },
      create: {
        districtCode,
        districtName: s.district,
        stateId: stateRecord.id,
        isActive: true,
        isDeleted: false,
      },
    });

    // 3. Upsert default Block for this District
    const blockCode = `BLK_${s.code}_${s.block.toUpperCase().replace(/\s+/g, '_')}`;
    await prisma.masterBlock.upsert({
      where: { blockCode },
      update: {
        blockName: s.block,
        districtId: districtRecord.id,
        isActive: true,
        isDeleted: false,
      },
      create: {
        blockCode,
        blockName: s.block,
        districtId: districtRecord.id,
        isActive: true,
        isDeleted: false,
      },
    });

    console.log(`  ✓ [ID ${s.id.toString().padStart(2, '0')}] ${s.name} -> ${s.district} -> ${s.block}`);
  }

  // Set sequence to 40 so autoincrement works cleanly for future inserts
  try {
    await prisma.$executeRawUnsafe(`SELECT setval('master_states_id_seq', 40, true);`);
  } catch (err) {
    // Ignore if sequence name differs
  }

  console.log('\n🎉 ALL 36 OFFICIAL STATES / UTs SEEDED SUCCESSFULLY!');
}

seedAllStates()
  .catch((e) => {
    console.error('❌ Error seeding states:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
