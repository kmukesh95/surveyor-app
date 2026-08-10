/**
 * Validation Helpers for Email, Mobile, Identity Proofs, Ration Card Numbers
 */

export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export const isValidMobile = (mobile: string): boolean => {
  if (!mobile || typeof mobile !== 'string') return false;
  const cleaned = mobile.replace(/\D/g, '');
  // 10-digit Indian mobile number starting with 6,7,8,9 or 12-digit with country code 91
  return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
};

export const isValidAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar || typeof aadhaar !== 'string') return false;
  const cleaned = aadhaar.replace(/\s|-/g, '');
  return /^\d{12}$/.test(cleaned);
};

export const isValidVoterId = (voterId: string): boolean => {
  if (!voterId || typeof voterId !== 'string') return false;
  const cleaned = voterId.trim().toUpperCase();
  return /^[A-Z]{3}\d{7}$/.test(cleaned);
};

export const isValidPassport = (passport: string): boolean => {
  if (!passport || typeof passport !== 'string') return false;
  const cleaned = passport.trim().toUpperCase();
  return /^[A-Z][0-9]{7}$/.test(cleaned);
};

export const isValidRationCard = (rationCard: string): boolean => {
  if (!rationCard || typeof rationCard !== 'string') return false;
  const cleaned = rationCard.trim();
  return cleaned.length >= 5 && cleaned.length <= 25;
};
