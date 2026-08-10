import { z } from 'zod';

export const addFamilyMemberSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  middleName: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  relationId: z.string().uuid({ message: 'Invalid relationId format. Must be a valid UUID.' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender must be MALE, FEMALE, or OTHER.' }),
  dob: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  age: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int({ message: 'Age must be an integer.' }).min(0).max(120).optional()
  ),
  idProofNumber: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  idProofUrl: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  occupation: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
});

export const updateFamilyMemberSchema = addFamilyMemberSchema.partial();
