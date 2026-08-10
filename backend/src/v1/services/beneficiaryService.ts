import { prisma } from '../../db/prisma';
import { checkBeneficiaryEditAllowed } from '../../utils/helpers';

export class BeneficiaryService {
  static async updateProfile(
    userId: string,
    payload: {
      fatherName?: string;
      motherName?: string;
      spouseName?: string;
      dob?: string;
      socialCategoryId?: string;
    }
  ) {
    await checkBeneficiaryEditAllowed(userId);

    const updateData: any = {};
    if (payload.fatherName) updateData.fatherName = payload.fatherName;
    if (payload.motherName) updateData.motherName = payload.motherName;
    if (payload.spouseName !== undefined) updateData.spouseName = payload.spouseName || null;
    if (payload.dob) updateData.dob = new Date(payload.dob);
    if (payload.socialCategoryId) updateData.socialCategoryId = payload.socialCategoryId;

    const detail = await prisma.beneficiaryDetail.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        fatherName: payload.fatherName || '',
        motherName: payload.motherName || '',
        spouseName: payload.spouseName || null,
        dob: payload.dob ? new Date(payload.dob) : null,
        socialCategoryId: payload.socialCategoryId || null,
        applicationStatus: 'DRAFT',
      },
      include: {
        socialCategory: true,
      },
    });

    return detail;
  }

  static async updateAddress(
    userId: string,
    payload: {
      houseNumber?: string;
      buildingName?: string;
      streetLandmark?: string;
      stateId?: number;
      districtId?: number;
      blockId?: number;
      pincode?: string;
    }
  ) {
    await checkBeneficiaryEditAllowed(userId);

    const existingAddress = await prisma.beneficiaryAddress.findFirst({
      where: { userId, isPrimary: true, isDeleted: false },
    });

    let address;
    if (existingAddress) {
      address = await prisma.beneficiaryAddress.update({
        where: { id: existingAddress.id },
        data: {
          houseNumber: payload.houseNumber || existingAddress.houseNumber,
          buildingName: payload.buildingName || existingAddress.buildingName,
          streetLandmark: payload.streetLandmark || existingAddress.streetLandmark,
          stateId: payload.stateId || existingAddress.stateId,
          districtId: payload.districtId || existingAddress.districtId,
          blockId: payload.blockId || existingAddress.blockId,
          pincode: payload.pincode || existingAddress.pincode,
        },
        include: { state: true, district: true, block: true },
      });
    } else {
      address = await prisma.beneficiaryAddress.create({
        data: {
          userId,
          houseNumber: payload.houseNumber || null,
          buildingName: payload.buildingName || null,
          streetLandmark: payload.streetLandmark || null,
          stateId: payload.stateId || null,
          districtId: payload.districtId || null,
          blockId: payload.blockId || null,
          pincode: payload.pincode || null,
          isPrimary: true,
        },
        include: { state: true, district: true, block: true },
      });
    }

    return address;
  }

  static async addQualification(
    userId: string,
    payload: {
      qualificationId: string;
      passingYear?: number;
      boardUniversity?: string;
      gradePercentage?: string;
      certificateDocUrl?: string;
    }
  ) {
    await checkBeneficiaryEditAllowed(userId);

    const qual = await prisma.beneficiaryQualification.create({
      data: {
        userId,
        qualificationId: payload.qualificationId,
        passingYear: payload.passingYear || null,
        boardUniversity: payload.boardUniversity || null,
        gradePercentage: payload.gradePercentage || null,
        certificateDocUrl: payload.certificateDocUrl || null,
      },
      include: { qualification: true },
    });

    return qual;
  }

  static async deleteQualification(userId: string, qualificationRecordId: string) {
    await checkBeneficiaryEditAllowed(userId);

    const existing = await prisma.beneficiaryQualification.findFirst({
      where: { id: qualificationRecordId, userId, isDeleted: false },
    });

    if (!existing) {
      throw new Error('Qualification record not found.');
    }

    await prisma.beneficiaryQualification.update({
      where: { id: qualificationRecordId },
      data: { isDeleted: true, isActive: false },
    });

    return true;
  }

  static async submitApplication(userId: string) {
    await checkBeneficiaryEditAllowed(userId);

    const detail = await prisma.beneficiaryDetail.findUnique({
      where: { userId },
    });

    if (!detail) {
      throw new Error('Please complete your profile details before final submission.');
    }

    if (!detail.fatherName || !detail.motherName) {
      throw new Error("Father's name and Mother's name are required before submitting application.");
    }

    const updated = await prisma.beneficiaryDetail.update({
      where: { userId },
      data: {
        applicationStatus: 'SUBMITTED',
      },
    });

    return {
      userId,
      applicationStatus: updated.applicationStatus,
      message: 'Application submitted successfully! Your profile is under review by Administrator.',
    };
  }
}
