import { z } from "zod";

export const superadminSchema = z.object({
  superadminUserID: z.string().uuid(),
  superadminEmail: z.string().email(),
});