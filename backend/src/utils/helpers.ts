import { prisma } from '../db/prisma';

/**
 * Generates a unique 8-character uppercase alphanumeric survey number (e.g., "AVPK3312", 4 uppercase letters + 4 digits)
 */
export async function generateUniqueSurveyNumber(): Promise<string> {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  let isUnique = false;
  let surveyNumber = '';

  while (!isUnique) {
    let letterPart = '';
    for (let i = 0; i < 4; i++) {
      letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    let digitPart = '';
    for (let i = 0; i < 4; i++) {
      digitPart += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    surveyNumber = `${letterPart}${digitPart}`;

    const existing = await prisma.beneficiaryDetail.findFirst({
      where: { surveyNumber },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return surveyNumber;
}

/**
 * Verifies if a beneficiary user is allowed to edit their profile/form details.
 * Editing is allowed ONLY when applicationStatus is 'DRAFT' or 'REJECTED'.
 * Once 'SUBMITTED' or 'APPROVED', editing is strictly locked.
 */
export async function checkBeneficiaryEditAllowed(userId: string): Promise<boolean> {
  const detail = await prisma.beneficiaryDetail.findUnique({
    where: { userId },
  });

  if (!detail) {
    return true; // New profile creation in progress
  }

  if (detail.applicationStatus === 'SUBMITTED') {
    throw new Error('Application is already submitted and pending Admin approval. Editing is not allowed.');
  }

  if (detail.applicationStatus === 'APPROVED') {
    throw new Error('Application has been approved by Administrator. Profile details cannot be modified.');
  }

  return true; // DRAFT or REJECTED state allows editing
}
