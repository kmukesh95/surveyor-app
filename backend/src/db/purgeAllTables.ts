import { prisma } from './prisma';

async function purgeAllTables() {
  console.log('🧹 Purging ALL database tables and resetting identities to 1...');

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
      console.log(`  ✓ Truncated & reset identity for: ${table}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Warning truncating ${table}: ${err.message}`);
    }
  }

  // Reset sequences explicitly
  const sequences = [
    'media_id_seq',
    'master_states_id_seq',
    'master_districts_id_seq',
    'master_blocks_id_seq',
    'master_social_categories_id_seq',
    'master_qualifications_id_seq',
    'master_relations_id_seq',
    'master_roles_id_seq',
    'user_locations_id_seq',
    'beneficiary_documents_id_seq',
    'beneficiary_family_members_id_seq',
    'beneficiary_qualifications_id_seq',
    'beneficiary_addresses_id_seq',
    'beneficiary_details_id_seq',
  ];

  for (const seq of sequences) {
    try {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "public"."${seq}" RESTART WITH 1;`);
    } catch (err) {
      // Ignore if sequence name differs or doesn't exist
    }
  }

  // Verify total row counts across all tables
  console.log('\n🔍 Verifying total row counts across all tables...');
  let totalRows = 0;
  for (const table of tables) {
    const result: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "public"."${table}";`);
    const count = result[0]?.count || 0;
    totalRows += count;
    console.log(`  • ${table}: ${count} rows`);
  }

  if (totalRows === 0) {
    console.log('\n✨ DATABASE IS 100% EMPTY & CLEAN! ALL RECTIFIES CLEARED AND IDENTITIES RESET TO 1!');
  } else {
    console.warn(`\n⚠️ Remaining rows detected: ${totalRows}`);
  }
}

purgeAllTables()
  .catch((e) => {
    console.error('❌ Purge Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
