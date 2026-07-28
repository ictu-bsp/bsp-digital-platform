ALTER TABLE "admin_users" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "password_expiration" date;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "account_lock_threshold" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "incorrect_password_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "alternate_email" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "first_time_user" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "can_change_password" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "turn_off_email_notif" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "added_by" uuid;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "deleted_date" timestamp;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_added_by_admin_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;