ALTER TABLE "pending_user_registrations" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "pending_user_registrations" DROP COLUMN "verified";