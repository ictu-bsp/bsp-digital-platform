// src/services/payment.service.ts

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { payments } from "@/db/schema";

export async function createPaymentRecord(registrationId: string) {
  const [record] = await db
    .insert(payments)
    .values({
      registrationId,
      paymentStatus: "awaiting_payment",
    })
    .returning();

  return record;
}

export async function setPaymentProviderId(
  paymentRecordId: string,
  providerId: string
) {
  await db
    .update(payments)
    .set({ paymentIntentId: providerId })
    .where(eq(payments.id, paymentRecordId));
}

export async function getPaymentByRegistrationId(registrationId: string) {
  const [record] = await db
    .select()
    .from(payments)
    .where(eq(payments.registrationId, registrationId));

  return record ?? null;
}

export async function updatePaymentStatus(
  paymentRecordId: string,
  status: "paid" | "failed"
) {
  await db
    .update(payments)
    .set({ paymentStatus: status })
    .where(eq(payments.id, paymentRecordId));
}