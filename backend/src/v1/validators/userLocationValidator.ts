import { z } from 'zod';

export const assignLocationSchema = z.object({
  userId: z.string().uuid({ message: 'User ID must be a valid UUID.' }),
  stateId: z.coerce.number().int({ message: 'State ID is required and must be an integer.' }),
  districtId: z.coerce.number().int().optional(),
  blockId: z.coerce.number().int().optional(),
});
