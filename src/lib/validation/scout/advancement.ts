import { z } from "zod";

export const advancementRankSchema = z.object({
  advancementID: z.string().uuid(),
  advancementRankName: z.string(),
  advancementDateObtained: z.string().datetime(),
});