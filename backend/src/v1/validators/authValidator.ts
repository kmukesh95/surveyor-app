import { z } from 'zod';
import { isValidEmail, isValidMobile } from '../../utils/validators';

export const directRegisterSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().refine((val) => !val || isValidEmail(val), { message: 'Invalid email address format.' }).optional(),
  mobile: z.string().refine((val) => isValidMobile(val), { message: 'Invalid 10-digit mobile number format.' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender must be MALE, FEMALE, or OTHER.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  dob: z.string().optional(),
});

export const surveyorRegisterSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  dob: z.string().optional(),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  motherName: z.string().min(2, { message: "Mother's name is required." }),
  spouseName: z.string().optional(),
  email: z.string().refine((val) => !val || isValidEmail(val), { message: 'Invalid email address format.' }).optional(),
  mobile: z.string().refine((val) => isValidMobile(val), { message: 'Invalid 10-digit mobile number format.' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender must be MALE, FEMALE, or OTHER.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  houseNumber: z.string().optional(),
  buildingName: z.string().optional(),
  streetLandmark: z.string().optional(),
  stateId: z.coerce.number().int().optional(),
  districtId: z.coerce.number().int().optional(),
  blockId: z.coerce.number().int().optional(),
  pincode: z.string().optional(),
  socialCategoryId: z.string().uuid({ message: 'Social Category ID must be a valid UUID.' }).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, { message: 'Mobile number, Email, or Survey Number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const verify2faSchema = z.object({
  tfaCode: z.string().length(6, { message: '2FA code must be exactly 6 digits.' }),
});
