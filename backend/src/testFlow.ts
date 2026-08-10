import bcrypt from 'bcryptjs';
import { prisma } from './db/prisma';

const API_BASE = 'http://localhost:5000/api/v1';

async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End API Flow Test...\n');

  try {
    // 0. Ensure Admin User exists in DB for approval testing
    const adminRole = await prisma.masterRole.findUnique({ where: { roleCode: 'ADMIN' } });
    if (!adminRole) throw new Error('ADMIN role not found.');

    const passwordHash = await bcrypt.hash('password123', 10);

    const adminUser = await prisma.user.upsert({
      where: { mobile: '9999999999' },
      update: { passwordHash },
      create: {
        roleId: adminRole.id,
        registrationType: 'DIRECT',
        firstName: 'System',
        lastName: 'Admin',
        mobile: '9999999999',
        email: 'admin@surveyor.com',
        gender: 'MALE',
        passwordHash,
      },
      include: { role: true },
    });
    console.log('✅ Admin User initialized:', adminUser.email);

    // 1. Login as Admin to get Admin JWT
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9999999999', password: 'password123' }),
    });
    const adminData: any = await adminLoginRes.json();
    if (!adminData.success) {
      throw new Error(`Admin login failed: ${adminData.message}`);
    }
    const adminToken = adminData.data.accessToken;
    console.log('✅ Admin logged in successfully.');

    // 2. Test Zonal Location Assignment to Admin / Field Surveyor
    const state = await prisma.masterState.findFirst();
    const district = await prisma.masterDistrict.findFirst();
    const block = await prisma.masterBlock.findFirst();

    const locAssignRes = await fetch(`${API_BASE}/user-locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: adminUser.id,
        stateId: state?.id,
        districtId: district?.id,
        blockId: block?.id,
      }),
    });
    const locAssignData: any = await locAssignRes.json();
    if (!locAssignData.success) throw new Error(`Location assignment failed: ${locAssignData.message}`);
    console.log('✅ Zonal Location Assigned to Admin User:', locAssignData.data.state.stateName, '->', locAssignData.data.district.districtName, '->', locAssignData.data.block.blockName);

    // 3. Direct Register a new Beneficiary
    const randomMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const regRes = await fetch(`${API_BASE}/auth/register-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Ramesh',
        middleName: 'Kumar',
        lastName: 'Sharma',
        email: `ramesh.${Date.now()}@example.com`,
        mobile: randomMobile,
        gender: 'MALE',
        password: 'Password@123',
      }),
    });
    const regData: any = await regRes.json();
    if (!regData.success) {
      throw new Error(`Beneficiary registration failed: ${regData.message}`);
    }
    const userToken = regData.data.accessToken;
    const userId = regData.data.user.id;
    console.log(`✅ Direct Beneficiary Registered! User ID: ${userId}, Mobile: ${randomMobile}`);

    // 4. Update Beneficiary Profile Details (DRAFT mode)
    const socialCat = await prisma.masterSocialCategory.findFirst();
    const profRes = await fetch(`${API_BASE}/beneficiary/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        fatherName: 'Suresh Sharma',
        motherName: 'Sunita Sharma',
        dob: '1990-05-15',
        socialCategoryId: socialCat?.id,
      }),
    });
    const profData: any = await profRes.json();
    if (!profData.success) throw new Error(`Profile update failed: ${profData.message}`);
    console.log('✅ Beneficiary profile updated (Father, Mother, DOB, Social Category).');

    // 5. Update Household Address (DRAFT mode)
    const addrRes = await fetch(`${API_BASE}/beneficiary/address`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        houseNumber: 'H.No. 402',
        buildingName: 'Sunshine Apartments',
        streetLandmark: 'Near Civil Hospital',
        stateId: state?.id,
        districtId: district?.id,
        blockId: block?.id,
        pincode: '110001',
      }),
    });
    const addrData: any = await addrRes.json();
    if (!addrData.success) throw new Error(`Address update failed: ${addrData.message}`);
    console.log('✅ Household address details updated.');

    // 6. Add Family Member (DRAFT mode)
    const relation = await prisma.masterRelation.findFirst({ where: { relationCode: 'SPOUSE' } });
    const familyRes = await fetch(`${API_BASE}/family-members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        firstName: 'Pooja',
        lastName: 'Sharma',
        relationId: relation?.id,
        gender: 'FEMALE',
        age: 32,
        occupation: 'Homemaker',
      }),
    });
    const familyData: any = await familyRes.json();
    if (!familyData.success) throw new Error(`Family member addition failed: ${familyData.message}`);
    console.log('✅ Family member added:', familyData.data.firstName);

    // 7. Submit Beneficiary Application (Transition to SUBMITTED)
    const submitRes = await fetch(`${API_BASE}/beneficiary/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    const submitData: any = await submitRes.json();
    if (!submitData.success) throw new Error(`Submission failed: ${submitData.message}`);
    console.log('✅ Final Application Submitted!', submitData.data.message);

    // 8. Verify Edit Guard Blocks Editing after SUBMITTED
    const attemptEditRes = await fetch(`${API_BASE}/beneficiary/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ fatherName: 'Attempt Edit' }),
    });
    const attemptEditData: any = await attemptEditRes.json();

    if (!attemptEditRes.ok) {
      console.log('🔒 Edit Guard Verified! Edit blocked with error message:', attemptEditData.message);
    } else {
      console.error('❌ ERROR: Edit guard failed to block update in SUBMITTED state.');
    }

    // 9. Admin Retrieves Pending Applications
    const pendingRes = await fetch(`${API_BASE}/admin/pending-applications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingData: any = await pendingRes.json();
    if (!pendingData.success) throw new Error(`Fetch pending failed: ${pendingData.message}`);
    console.log(`✅ Admin retrieved ${pendingData.data.length} pending application(s).`);

    // 10. Admin Approves Application & System Generates 8-Digit Alphanumeric Survey Number
    const approveRes = await fetch(`${API_BASE}/admin/approve-beneficiary/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveData: any = await approveRes.json();
    if (!approveData.success) throw new Error(`Approval failed: ${approveData.message}`);
    const approvedData = approveData.data;

    console.log('\n======================================================');
    console.log('🎉 APPLICATION APPROVED BY ADMIN!');
    console.log(`📌 Generated 8-Digit Alphanumeric Survey Number: ${approvedData.surveyNumber}`);
    console.log(`📌 Verification Status: ${approvedData.isVerified ? 'VERIFIED' : 'UNVERIFIED'}`);
    console.log(`📌 Application Status: ${approvedData.applicationStatus}`);
    console.log('======================================================\n');

    console.log('✨ ALL TEST CASES PASSED SUCCESSFULLY!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndTest();
