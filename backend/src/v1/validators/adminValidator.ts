import { z } from 'zod';

export const rejectApplicationSchema = z.object({
  rejectionReason: z.string().min(5, { message: 'Rejection reason must be at least 5 characters long.' }),
});

export const createStaffUserSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }).optional().or(z.literal('')),
  mobile: z.string().regex(/^[6-9]\d{9}$/, { message: 'Mobile number must be a valid 10-digit Indian mobile number.' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  roleCode: z.enum(['ADMIN', 'SURVEYOR', 'CMS_USER'], { message: 'Role code must be ADMIN, SURVEYOR, or CMS_USER.' }),
  stateId: z.coerce.number().int({ message: 'State ID is required.' }),
  districtId: z.coerce.number().int().optional(),
  blockId: z.coerce.number().int().optional(),
});
