'use server';

import { db } from '@/db'; // Your environmental gateway client
import { users } from '@/db/schema'; // Drizzle schema blueprint
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getScoutsByCouncil(councilName: string) {
  try {
    const records = await db
      .select()
      .from(users)
      .where(eq(users.council, councilName))
      .orderBy(desc(users.createdAt));

    return { success: true, data: records };
  } catch (error) {
    console.error('Drizzle Fetch Error:', error);
    return { success: false, error: 'Failed to sync local data rows.' };
  }
}

/**
 * Mutation Action: Manually triggers a membership state update 
 * (e.g., when an admin approves an offline cash registration)
 */
export async function verifyScoutPayment(scoutId: string, transactionReference: string) {
  try {
    // Standard Drizzle Update statement
    const updatedRows = await db
      .update(users)
      .set({
        paymentStatus: 'paid',
        paymentIntentId: transactionReference,
        verificationStatus: 'active',
      })
      .where(eq(users.id, scoutId))
      .returning(); // PostgreSQL native feature: returns the modified row instantly

    // In Next.js App Router, this clears the CDN edge cache for the target view path
    revalidatePath('/admin/dashboard');

    return { 
      success: true, 
      message: `Scout ${updatedRows[0].firstName} is now fully ACTIVE!`,
      data: updatedRows[0] 
    };
  } catch (error) {
    console.error('Drizzle Mutation Error:', error);
    return { success: false, error: 'Database transaction update rejected.' };
  }
}