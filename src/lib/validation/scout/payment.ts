import { z } from "zod";

export const paymentSchema = z.object({
  transactionID: z.string().uuid(),
  paymentMethod: z.string(),
  dateOfTransaction: z.string().datetime(),
  amountPaid: z.coerce.number().positive(),
});