import { z } from 'zod';

// Kept out of the browser's preview module so validation adds no client JavaScript.
export const imageEditsSchema = z.object({
  left: z.number().int().min(0).max(99),
  top: z.number().int().min(0).max(99),
  width: z.number().int().min(1).max(100),
  height: z.number().int().min(1).max(100),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
  flip: z.boolean(),
  maxSize: z.number().int().min(320).max(1920),
}).strict().refine(v => v.left + v.width <= 100 && v.top + v.height <= 100);
