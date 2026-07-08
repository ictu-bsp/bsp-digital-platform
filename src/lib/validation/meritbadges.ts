import { z } from "zod";

export const meritBadgeSchema = z.object({
  meritBadgeID: z.string().uuid(),
  meritBadgeName: z.string(),
  meritBadgeDateObtained: z.string().datetime(),
});