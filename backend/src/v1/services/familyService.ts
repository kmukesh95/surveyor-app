import { prisma } from '../../db/prisma';
import { checkBeneficiaryEditAllowed } from '../../utils/helpers';

export class FamilyService {
  static async addFamilyMember(
    headUserId: string,
    payload: {
      firstName: string;
      middleName?: string;
      lastName: string;
      relationId: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      dob?: string;
      age?: number;
      idProofNumber?: string;
      idProofUrl?: string;
      occupation?: string;
    }
  ) {
    // Check if beneficiary is allowed to edit form
    await checkBeneficiaryEditAllowed(headUserId);

    // Verify head user exists
    const headUser = await prisma.user.findFirst({
      where: { id: headUserId, isDeleted: false },
    });
    if (!headUser) {
      throw new Error('Head of household user not found.');
    }

    // Verify relation exists
    const relation = await prisma.masterRelation.findFirst({
      where: { id: payload.relationId, isActive: true, isDeleted: false },
    });
    if (!relation) {
      throw new Error('Invalid relationId provided.');
    }

    const member = await prisma.beneficiaryFamilyMember.create({
      data: {
        headUserId,
        firstName: payload.firstName,
        middleName: payload.middleName || null,
        lastName: payload.lastName,
        relationId: payload.relationId,
        gender: payload.gender,
        dob: payload.dob ? new Date(payload.dob) : null,
        age: payload.age || null,
        idProofNumber: payload.idProofNumber || null,
        idProofUrl: payload.idProofUrl || null,
        occupation: payload.occupation || null,
      },
      include: {
        relation: true,
      },
    });

    return member;
  }

  static async getFamilyMembers(headUserId: string) {
    const members = await prisma.beneficiaryFamilyMember.findMany({
      where: { headUserId, isDeleted: false },
      include: {
        relation: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return members;
  }

  static async getFamilyMemberById(headUserId: string, memberId: string) {
    const member = await prisma.beneficiaryFamilyMember.findFirst({
      where: { id: memberId, headUserId, isDeleted: false },
      include: {
        relation: true,
      },
    });
    if (!member) {
      throw new Error('Family member record not found.');
    }
    return member;
  }

  static async updateFamilyMember(
    headUserId: string,
    memberId: string,
    payload: Partial<{
      firstName: string;
      middleName?: string;
      lastName: string;
      relationId: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      dob?: string;
      age?: number;
      idProofNumber?: string;
      idProofUrl?: string;
      occupation?: string;
    }>
  ) {
    // Check if beneficiary is allowed to edit form
    await checkBeneficiaryEditAllowed(headUserId);

    const existing = await prisma.beneficiaryFamilyMember.findFirst({
      where: { id: memberId, headUserId, isDeleted: false },
    });
    if (!existing) {
      throw new Error('Family member record not found or unauthorized.');
    }

    const updateData: any = {};
    if (payload.firstName) updateData.firstName = payload.firstName;
    if (payload.middleName !== undefined) updateData.middleName = payload.middleName || null;
    if (payload.lastName) updateData.lastName = payload.lastName;
    if (payload.relationId) updateData.relationId = payload.relationId;
    if (payload.gender) updateData.gender = payload.gender;
    if (payload.dob) updateData.dob = new Date(payload.dob);
    if (payload.age !== undefined) updateData.age = payload.age;
    if (payload.idProofNumber !== undefined) updateData.idProofNumber = payload.idProofNumber || null;
    if (payload.idProofUrl !== undefined) updateData.idProofUrl = payload.idProofUrl || null;
    if (payload.occupation !== undefined) updateData.occupation = payload.occupation || null;

    const updated = await prisma.beneficiaryFamilyMember.update({
      where: { id: memberId },
      data: updateData,
      include: {
        relation: true,
      },
    });

    return updated;
  }

  static async deleteFamilyMember(headUserId: string, memberId: string) {
    // Check if beneficiary is allowed to edit form
    await checkBeneficiaryEditAllowed(headUserId);

    const existing = await prisma.beneficiaryFamilyMember.findFirst({
      where: { id: memberId, headUserId, isDeleted: false },
    });
    if (!existing) {
      throw new Error('Family member record not found or unauthorized.');
    }

    // Soft delete
    await prisma.beneficiaryFamilyMember.update({
      where: { id: memberId },
      data: { isDeleted: true, isActive: false },
    });

    return true;
  }
}
