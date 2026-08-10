import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { CacheService } from '../../redis/redisClient';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { ERROR_MESSAGES } from '../../constants';

export class AuthService {
  private static async getBeneficiaryRoleId(): Promise<string> {
    const role = await prisma.masterRole.findUnique({
      where: { roleCode: 'BENEFICIARY' },
    });
    if (!role) throw new Error('BENEFICIARY role not found in master database.');
    return role.id;
  }

  static async registerDirect(payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    mobile: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    password: string;
    dob?: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: payload.mobile },
          ...(payload.email ? [{ email: payload.email.toLowerCase() }] : []),
        ],
        isDeleted: false,
      },
    });

    if (existingUser) {
      if (existingUser.mobile === payload.mobile) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_MOBILE);
      }
      if (payload.email && existingUser.email === payload.email.toLowerCase()) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
      }
    }

    const roleId = await this.getBeneficiaryRoleId();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    const newUser = await prisma.user.create({
      data: {
        roleId,
        registrationType: 'DIRECT',
        firstName: payload.firstName,
        middleName: payload.middleName || null,
        lastName: payload.lastName,
        email: payload.email ? payload.email.toLowerCase() : null,
        mobile: payload.mobile,
        gender: payload.gender,
        passwordHash,
      },
      include: {
        role: true,
      },
    });

    const accessToken = generateAccessToken({
      id: newUser.id,
      email: newUser.email || newUser.mobile,
      role: newUser.role.roleCode,
    });

    const refreshToken = generateRefreshToken({
      id: newUser.id,
      email: newUser.email || newUser.mobile,
      role: newUser.role.roleCode,
    });

    await CacheService.set(
      `session:${newUser.id}`,
      JSON.stringify({ accessToken, refreshToken, role: newUser.role.roleCode }),
      7 * 24 * 3600
    );

    const { passwordHash: _, tfaCode: __, ...cleanUser } = newUser;
    return { user: cleanUser, accessToken, refreshToken };
  }

  static async registerSurveyor(
    surveyorId: string,
    payload: {
      firstName: string;
      middleName?: string;
      lastName: string;
      dob?: string;
      fatherName: string;
      motherName: string;
      spouseName?: string;
      email?: string;
      mobile: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      password: string;
      houseNumber?: string;
      buildingName?: string;
      streetLandmark?: string;
      stateId?: number;
      districtId?: number;
      blockId?: number;
      pincode?: string;
      socialCategoryId?: string;
    }
  ) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: payload.mobile },
          ...(payload.email ? [{ email: payload.email.toLowerCase() }] : []),
        ],
        isDeleted: false,
      },
    });

    if (existingUser) {
      if (existingUser.mobile === payload.mobile) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_MOBILE);
      }
      if (payload.email && existingUser.email === payload.email.toLowerCase()) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_EMAIL);
      }
    }

    const roleId = await this.getBeneficiaryRoleId();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(payload.password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          roleId,
          registrationType: 'SURVEYOR',
          createdById: surveyorId,
          firstName: payload.firstName,
          middleName: payload.middleName || null,
          lastName: payload.lastName,
          email: payload.email ? payload.email.toLowerCase() : null,
          mobile: payload.mobile,
          gender: payload.gender,
          passwordHash,
        },
        include: { role: true },
      });

      const beneficiaryDetail = await tx.beneficiaryDetail.create({
        data: {
          userId: user.id,
          surveyNumber: null,
          applicationStatus: 'DRAFT',
          dob: payload.dob ? new Date(payload.dob) : null,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          spouseName: payload.spouseName || null,
          socialCategoryId: payload.socialCategoryId || null,
        },
      });

      const beneficiaryAddress = await tx.beneficiaryAddress.create({
        data: {
          userId: user.id,
          houseNumber: payload.houseNumber || null,
          buildingName: payload.buildingName || null,
          streetLandmark: payload.streetLandmark || null,
          stateId: payload.stateId || null,
          districtId: payload.districtId || null,
          blockId: payload.blockId || null,
          pincode: payload.pincode || null,
          isPrimary: true,
        },
      });

      return { user, beneficiaryDetail, beneficiaryAddress };
    });

    const accessToken = generateAccessToken({
      id: result.user.id,
      email: result.user.email || result.user.mobile,
      role: result.user.role.roleCode,
    });

    const refreshToken = generateRefreshToken({
      id: result.user.id,
      email: result.user.email || result.user.mobile,
      role: result.user.role.roleCode,
    });

    await CacheService.set(
      `session:${result.user.id}`,
      JSON.stringify({ accessToken, refreshToken, role: result.user.role.roleCode }),
      7 * 24 * 3600
    );

    const { passwordHash: _, tfaCode: __, ...cleanUser } = result.user;
    return {
      user: cleanUser,
      beneficiaryDetail: result.beneficiaryDetail,
      beneficiaryAddress: result.beneficiaryAddress,
      accessToken,
      refreshToken,
    };
  }

  static async login(payload: { identifier: string; password: string }) {
    const cleanId = payload.identifier.trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: cleanId },
          { email: cleanId.toLowerCase() },
          { beneficiaryDetail: { surveyNumber: cleanId } },
        ],
        isActive: true,
        isDeleted: false,
      },
      include: {
        role: true,
        beneficiaryDetail: true,
      },
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isMatch) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const tfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tfaExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tfaCode,
        tfaExpiresAt,
        lastLoginAt: new Date(),
      },
    });

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email || user.mobile,
      role: user.role.roleCode,
      surveyNumber: user.beneficiaryDetail?.surveyNumber || undefined,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email || user.mobile,
      role: user.role.roleCode,
      surveyNumber: user.beneficiaryDetail?.surveyNumber || undefined,
    });

    await CacheService.set(
      `session:${user.id}`,
      JSON.stringify({ accessToken, refreshToken, role: user.role.roleCode }),
      7 * 24 * 3600
    );

    const { passwordHash: _, tfaCode: __, ...cleanUser } = user;
    return {
      user: cleanUser,
      tfaCodeDemo: tfaCode,
      accessToken,
      refreshToken,
    };
  }

  static async verify2FA(userId: string, tfaCode: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, isActive: true, isDeleted: false },
    });

    if (!user || !user.tfaCode || user.tfaCode !== tfaCode) {
      throw new Error('Invalid 2FA verification code.');
    }

    if (user.tfaExpiresAt && new Date() > user.tfaExpiresAt) {
      throw new Error('2FA verification code has expired.');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { tfaCode: null, tfaExpiresAt: null },
    });

    return { verified: true };
  }

  static async logout(userId: string, token: string) {
    await CacheService.set(`blacklist:${token}`, 'revoked', 15 * 60);
    await CacheService.del(`session:${userId}`);
    return true;
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
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
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const { passwordHash: _, tfaCode: __, ...cleanUser } = user;
    return cleanUser;
  }
}
