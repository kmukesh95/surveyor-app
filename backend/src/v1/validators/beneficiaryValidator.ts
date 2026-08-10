import { z } from 'zod';

export const updateProfileSchema = z.object({
  fatherName: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(2, { message: "Father's name must be at least 2 characters." }).optional()),
  motherName: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().min(2, { message: "Mother's name must be at least 2 characters." }).optional()),
  spouseName: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  dob: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  socialCategoryId: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().uuid({ message: 'Social Category ID must be a valid UUID.' }).optional()),
});

export const updateAddressSchema = z.object({
  houseNumber: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  buildingName: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  streetLandmark: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  stateId: z.coerce.number().int().optional(),
  districtId: z.coerce.number().int().optional(),
  blockId: z.coerce.number().int().optional(),
  pincode: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
});

export const addQualificationSchema = z.object({
  qualificationId: z.string().uuid({ message: 'Qualification ID must be a valid UUID.' }),
  passingYear: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int({ message: 'Passing year must be an integer.' }).min(1950).max(2030).optional()
  ),
  boardUniversity: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  gradePercentage: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
  certificateDocUrl: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.string().optional()),
});
