import { z } from "zod";

export const localCouncilSchema = z.object({
  localCouncilUserID: z.string().uuid(),
  localCouncilName: z.string(),
  email: z.string().email(),
});