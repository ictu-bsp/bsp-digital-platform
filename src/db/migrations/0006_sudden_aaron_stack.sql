CREATE TYPE "public"."scout_rank" AS ENUM('KID', 'KAB', 'BOY', 'SENIOR', 'ROVER');--> statement-breakpoint
CREATE TYPE "public"."scout_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED');--> statement-breakpoint
ALTER TABLE "scouts" RENAME COLUMN "scout_id_number" TO "membership_number";--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "rank" "scout_rank" DEFAULT 'KID' NOT NULL;--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "status" "scout_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "joined_at" timestamp;--> statement-breakpoint
ALTER TABLE "scouts" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_user_id_unique" UNIQUE("user_id");