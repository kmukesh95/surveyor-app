import { z } from 'zod';

export const districtQuerySchema = z.object({
  stateId: z.coerce.number().int({ message: 'State ID must be an integer.' }).optional(),
});

export const blockQuerySchema = z.object({
  districtId: z.coerce.number().int({ message: 'District ID must be an integer.' }).optional(),
});
