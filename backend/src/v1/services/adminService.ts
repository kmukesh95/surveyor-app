import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { generateUniqueSurveyNumber } from '../../utils/helpers';

export class AdminService {
  static async createStaffUser(payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    mobile: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    password: string;
    roleCode: 'ADMIN' | 'SURVEYOR' | 'CMS_USER';
    stateId: number;
    districtId?: number;
    blockId?: number;
  }) {
    // Check if role exists
    const role = await prisma.masterRole.findFirst({
      where: { roleCode: payload.roleCode, isActive: true, isDeleted: false },
    });
    if (!role) throw new Error(`Role '${payload.roleCode}' not found in master roles.`);

    // Check duplicate mobile or email
    const existingMobile = await prisma.user.findFirst({ where: { mobile: payload.mobile, isDeleted: false } });
    if (existingMobile) throw new Error('A user with this mobile number already exists.');

    if (payload.email) {
      const existingEmail = await prisma.user.findFirst({ where: { email: payload.email, isDeleted: false } });
      if (existingEmail) throw new Error('A user with this email address already exists.');
    }

    // Verify location masters exist
    const state = await prisma.masterState.findFirst({ where: { id: payload.stateId, isActive: true, isDeleted: false } });
    if (!state) throw new Error('Invalid State ID provided.');

    if (payload.districtId) {
      const district = await prisma.masterDistrict.findFirst({
        where: { id: payload.districtId, stateId: payload.stateId, isActive: true, isDeleted: false },
      });
      if (!district) throw new Error('Invalid District ID for specified State.');
    }

    if (payload.blockId) {
      if (!payload.districtId) throw new Error('District ID is required when specifying a Block.');
      const block = await prisma.masterBlock.findFirst({
        where: { id: payload.blockId, districtId: payload.districtId, isActive: true, isDeleted: false },
      });
      if (!block) throw new Error('Invalid Block ID for specified District.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(payload.password, 10);

    // Create User in database
    const newUser = await prisma.user.create({
      data: {
        roleId: role.id,
        registrationType: 'DIRECT',
        firstName: payload.firstName,
        middleName: payload.middleName || null,
        lastName: payload.lastName,
        email: payload.email || null,
        mobile: payload.mobile,
        gender: payload.gender,
        passwordHash,
      },
      include: { role: true },
    });

    // Create Zonal Location mapping in user_locations table
    const userLocation = await prisma.userLocation.create({
      data: {
        userId: newUser.id,
        stateId: payload.stateId,
        districtId: payload.districtId || null,
        blockId: payload.blockId || null,
      },
      include: { state: true, district: true, block: true },
    });

    return {
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
      },
      userLocation,
    };
  }

  static async getPendingApplications() {
    const pendingUsers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        beneficiaryDetail: {
          applicationStatus: 'SUBMITTED',
        },
      },
      include: {
        role: true,
        beneficiaryDetail: {
          include: { socialCategory: true },
        },
        beneficiaryAddresses: {
          where: { isDeleted: false },
          include: { state: true, district: true, block: true },
        },
        beneficiaryQualifications: {
          where: { isDeleted: false },
          include: { qualification: true },
        },
        beneficiaryFamilyMembers: {
          where: { isDeleted: false },
          include: { relation: true },
        },
        beneficiaryDocuments: {
          where: { isDeleted: false },
          include: { media: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pendingUsers;
  }

  static async approveBeneficiary(adminId: string, userId: string) {
    const detail = await prisma.beneficiaryDetail.findUnique({
      where: { userId },
    });

    if (!detail) {
      throw new Error('Beneficiary profile details not found.');
    }

    if (detail.applicationStatus === 'APPROVED' && detail.surveyNumber) {
      throw new Error(`Profile is already approved. Survey Number: ${detail.surveyNumber}`);
    }

    // Generate unique 8-character uppercase alphanumeric survey number
    const surveyNumber = await generateUniqueSurveyNumber();

    const updatedDetail = await prisma.beneficiaryDetail.update({
      where: { userId },
      data: {
        surveyNumber,
        applicationStatus: 'APPROVED',
        isVerified: true,
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    });

    return {
      userId,
      surveyNumber,
      applicationStatus: updatedDetail.applicationStatus,
      isVerified: updatedDetail.isVerified,
      verifiedAt: updatedDetail.verifiedAt,
    };
  }

  static async rejectBeneficiary(adminId: string, userId: string, rejectionReason: string) {
    const detail = await prisma.beneficiaryDetail.findUnique({
      where: { userId },
    });

    if (!detail) {
      throw new Error('Beneficiary profile details not found.');
    }

    const updatedDetail = await prisma.beneficiaryDetail.update({
      where: { userId },
      data: {
        applicationStatus: 'REJECTED',
        isVerified: false,
        verifiedById: adminId,
        rejectionReason,
      },
    });

    return {
      userId,
      applicationStatus: updatedDetail.applicationStatus,
      rejectionReason: updatedDetail.rejectionReason,
    };
  }
}
