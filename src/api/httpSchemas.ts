import { z } from 'zod';

export const HttpOkSchema = z.object({
  status: z.number().int(),
  ok: z.boolean(),
  url: z.string().url(),
});

export type HttpOk = z.infer<typeof HttpOkSchema>;

