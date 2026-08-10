import { prisma } from '../../db/prisma';
import { checkBeneficiaryEditAllowed } from '../../utils/helpers';

export class DocumentService {
  static async addOrReplaceDocument(
    userId: string,
    payload: {
      docType: 'PROFILE_PHOTO' | 'QUALIFICATION' | 'IDENTITY_PROOF' | 'RATION_CARD' | 'VOTER_ID';
      fileName: string;
      fileType: string;
      filePath: string;
    }
  ) {
    // 1. Verify user status allows editing (DRAFT or REJECTED)
    await checkBeneficiaryEditAllowed(userId);

    // 2. Create entry in Media table first
    const media = await prisma.media.create({
      data: {
        fileName: payload.fileName,
        fileType: payload.fileType,
        filePath: payload.filePath,
      },
    });

    // 3. Check if active document already exists for this (userId, docType)
    const existingDoc = await prisma.beneficiaryDocument.findFirst({
      where: {
        userId,
        docType: payload.docType,
        isDeleted: false,
      },
    });

    if (existingDoc && existingDoc.mediaId === media.id) {
      throw new Error('Cannot update document with the same media file. Please upload a new file.');
    }

    let doc;
    if (existingDoc) {
      // Update existing document entry with new mediaId
      doc = await prisma.beneficiaryDocument.update({
        where: { id: existingDoc.id },
        data: {
          mediaId: media.id,
          isActive: true,
          isDeleted: false,
        },
        include: { media: true },
      });
    } else {
      // Create new document entry
      doc = await prisma.beneficiaryDocument.create({
        data: {
          userId,
          docType: payload.docType,
          mediaId: media.id,
        },
        include: { media: true },
      });
    }

    // If PROFILE_PHOTO, sync profilePhotoUrl in BeneficiaryDetail
    if (payload.docType === 'PROFILE_PHOTO') {
      await prisma.beneficiaryDetail.updateMany({
        where: { userId },
        data: { profilePhotoUrl: payload.filePath },
      });
    }

    return doc;
  }

  static async getUserDocuments(userId: string) {
    const docs = await prisma.beneficiaryDocument.findMany({
      where: { userId, isDeleted: false },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });
    return docs;
  }

  static async deleteDocument(userId: string, docId: number) {
    // Check if beneficiary is allowed to edit form
    await checkBeneficiaryEditAllowed(userId);

    const existing = await prisma.beneficiaryDocument.findFirst({
      where: { id: docId, userId, isDeleted: false },
    });

    if (!existing) {
      throw new Error('Document record not found or unauthorized.');
    }

    await prisma.beneficiaryDocument.update({
      where: { id: docId },
      data: { isDeleted: true, isActive: false },
    });

    return true;
  }
}
