CREATE TYPE "public"."activity_registration_status" AS ENUM('PENDING_REQUIREMENTS', 'PENDING_PAYMENT', 'PENDING_UNIT_APPROVAL', 'PENDING_ADMIN_APPROVAL', 'APPROVED', 'REJECTED', 'LEFT', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."notification_visibility" AS ENUM('PUBLIC', 'SCOUTS', 'COUNCIL', 'REGIONAL');--> statement-breakpoint
CREATE TABLE "activity_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"payment_intent_id" text,
	"payment_method" text,
	"receipt_number" text,
	"payment_status" "payment_status" DEFAULT 'awaiting_payment' NOT NULL,
	"refunded_at" timestamp,
	"refund_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"visibility" "notification_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"author_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_users_username_unique";--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "registration_status" "application_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "parent_consent_file" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "parent_guardian_id_file" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "medical_certificate_file" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "medical_waiver_file" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "requirements_submitted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "payment_status" "payment_status" DEFAULT 'awaiting_payment' NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "payment_reference_id" uuid;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "registration_fee" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "unit_leader_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "unit_leader_approved_by" uuid;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "unit_leader_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "admin_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "admin_approved_by" uuid;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "admin_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "joined_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "left_at" timestamp;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "rejected_by" uuid;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "activity_payments" ADD CONSTRAINT "activity_payments_registration_id_activity_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."activity_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_council_username_unq" UNIQUE("council_id","username");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_region_username_unq" UNIQUE("region_id","username");