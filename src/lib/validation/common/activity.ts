//src/lib/validation/common/activity.ts

import { z } from "zod";

export const ActivitySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),

  startDate: z.coerce.date(),

  endDate: z.coerce.date().optional(),

  registrationDeadline: z.coerce.date().optional(),

  location: z.string().min(2),

  category: z.enum([
    "CAMPING",
    "TRAINING",
    "COMMUNITY_SERVICE",
    "SEMINAR",
    "COMPETITION",
    "CEREMONY",
    "MEETING",
    "OTHER",
  ]),

  maxParticipants: z.number().optional(),

  isPublished: z.boolean().default(true),

  imageUrl: z.string().optional(),
});

export type ActivityInput = z.infer<typeof ActivitySchema>;