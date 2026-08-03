CREATE TYPE "public"."announcement_visibility" AS ENUM('PUBLIC', 'SCOUTS', 'COUNCIL', 'REGIONAL');--> statement-breakpoint
CREATE TYPE "public"."activity_category" AS ENUM('COUNCIL', 'REGIONAL', 'NATIONAL');--> statement-breakpoint
CREATE TYPE "public"."activity_registration_status" AS ENUM('PENDING_REQUIREMENTS', 'PENDING_PAYMENT', 'PENDING_UNIT_APPROVAL', 'PENDING_ADMIN_APPROVAL', 'APPROVED', 'REJECTED', 'LEFT', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('CHIEF_EXECUTIVE', 'MEMBERSHIP_OFFICER', 'ACTIVITIES_OFFICER', 'FINANCE_OFFICER', 'REGISTRAR', 'REPORTS_OFFICER');--> statement-breakpoint
CREATE TYPE "public"."admin_scope" AS ENUM('COUNCIL', 'REGIONAL', 'NATIONAL');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('awaiting_payment', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'membership_approved', 'active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."scout_advancement_rank" AS ENUM('YOUNG_USA', 'GROWING_USA', 'LEAPING_USA', 'MEMBERSHIP', 'TENDERFOOT_SCOUT', 'SECOND_CLASS_SCOUT', 'FIRST_CLASS_SCOUT', 'SCOUT_CITIZEN_SERVICE', 'EXPLORER_SCOUT', 'PATHFINDER_SCOUT', 'OUTDOORSMAN_SCOUT', 'VENTURER_SCOUT', 'EAGLE_SCOUT', 'YELLOW_QUADRANT', 'GREEN_QUADRANT', 'RED_QUADRANT', 'BLUE_QUADRANT', 'CHIEF_SCOUT_NATION_BUILDER');--> statement-breakpoint
CREATE TYPE "public"."scout_section" AS ENUM('KID', 'KAB', 'BOY', 'SENIOR', 'ROVER');--> statement-breakpoint
CREATE TYPE "public"."scout_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'pending', 'active');--> statement-breakpoint
CREATE TYPE "public"."notification_visibility" AS ENUM('PUBLIC', 'SCOUTS', 'COUNCIL', 'REGIONAL');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"registration_deadline" timestamp,
	"location" text NOT NULL,
	"category" "activity_category" NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"max_participants" integer,
	"minimum_section" "scout_section",
	"registration_fee" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "activity_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scout_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"remarks" text,
	"registration_status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"parent_consent_file" text,
	"parent_guardian_id_file" text,
	"medical_certificate_file" text,
	"medical_waiver_file" text,
	"requirements_submitted" boolean DEFAULT false NOT NULL,
	"payment_status" "payment_status" DEFAULT 'awaiting_payment' NOT NULL,
	"payment_reference_id" uuid,
	"registration_fee" text,
	"refunded_at" timestamp,
	"unit_leader_approved" boolean DEFAULT false NOT NULL,
	"unit_leader_approved_by" uuid,
	"unit_leader_approved_at" timestamp,
	"admin_approved" boolean DEFAULT false NOT NULL,
	"admin_approved_by" uuid,
	"admin_approved_at" timestamp,
	"joined_at" timestamp,
	"left_at" timestamp,
	"rejection_reason" text,
	"rejected_by" uuid,
	"rejected_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "administrators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"position" text,
	"office" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" "admin_scope" DEFAULT 'COUNCIL' NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"created_by" uuid NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" "admin_role" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"password_expiration" date,
	"account_lock_threshold" integer DEFAULT 5,
	"incorrect_password_attempts" integer DEFAULT 0 NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"email" text,
	"alternate_email" text,
	"profile_picture" text,
	"first_time_user" boolean DEFAULT true NOT NULL,
	"can_change_password" boolean DEFAULT true NOT NULL,
	"turn_off_email_notif" boolean DEFAULT false NOT NULL,
	"added_by" uuid,
	"deleted_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_council_username_unq" UNIQUE("council_id","username"),
	CONSTRAINT "admin_users_region_username_unq" UNIQUE("region_id","username")
);
--> statement-breakpoint
CREATE TABLE "advancements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scout_id" uuid NOT NULL,
	"rank" "scout_advancement_rank" NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(150) NOT NULL,
	"content" text NOT NULL,
	"image_url" text,
	"visibility" "announcement_visibility" DEFAULT 'PUBLIC' NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"author_id" uuid NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "councils" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"council_number" text NOT NULL,
	"region_id" uuid NOT NULL,
	CONSTRAINT "councils_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"region_number" text NOT NULL,
	CONSTRAINT "regions_name_unique" UNIQUE("name"),
	CONSTRAINT "regions_region_number_unique" UNIQUE("region_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"password_hash" text NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"suffix" text,
	"birthdate" date NOT NULL,
	"sex" text NOT NULL,
	"role" text DEFAULT 'VISITOR' NOT NULL,
	"council_id" uuid,
	"region_id" uuid,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "scouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"council_id" uuid NOT NULL,
	"membership_number" text,
	"section" "scout_section" DEFAULT 'KID' NOT NULL,
	"advancement_rank" "scout_advancement_rank",
	"status" "scout_status" DEFAULT 'PENDING' NOT NULL,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"joined_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scouts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "scout_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferred_council_id" uuid,
	"scouting_position" text,
	"scout_section" "scout_section",
	"advancement_rank" "scout_advancement_rank",
	"tenure" integer DEFAULT 0,
	"region" text,
	"community_based" boolean DEFAULT false NOT NULL,
	"sponsoring_institution" text,
	"requested_registration_years" integer DEFAULT 1 NOT NULL,
	"blood_type" text,
	"address" text,
	"telephone_number" text,
	"emergency_contact_name" text,
	"emergency_contact_relationship" text,
	"emergency_contact_number" text,
	"remarks" text,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scout_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scout_id" uuid NOT NULL,
	"application_id" uuid,
	"council_id" uuid,
	"registration_years" integer DEFAULT 1 NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_user_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"parent_email" text,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"suffix" text,
	"birthdate" timestamp NOT NULL,
	"sex" text NOT NULL,
	"role" text NOT NULL,
	"verification_code" text NOT NULL,
	"verification_expires" timestamp NOT NULL,
	"email_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pending_user_registrations_email_unique" UNIQUE("email")
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
CREATE TABLE "merit_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merit_badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" uuid,
	"application_id" uuid,
	"payment_intent_id" text,
	"amount" integer DEFAULT 0 NOT NULL,
	"payment_status" "payment_status" DEFAULT 'awaiting_payment' NOT NULL,
	"payment_method" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"admin_user_id" uuid,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_payments" ADD CONSTRAINT "activity_payments_registration_id_activity_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."activity_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_added_by_admin_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."admin_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advancements" ADD CONSTRAINT "advancements_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "councils" ADD CONSTRAINT "councils_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scouts" ADD CONSTRAINT "scouts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD CONSTRAINT "scout_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD CONSTRAINT "scout_applications_preferred_council_id_councils_id_fk" FOREIGN KEY ("preferred_council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_applications" ADD CONSTRAINT "scout_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_registrations" ADD CONSTRAINT "scout_registrations_scout_id_scouts_id_fk" FOREIGN KEY ("scout_id") REFERENCES "public"."scouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_registrations" ADD CONSTRAINT "scout_registrations_application_id_scout_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."scout_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scout_registrations" ADD CONSTRAINT "scout_registrations_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_council_id_councils_id_fk" FOREIGN KEY ("council_id") REFERENCES "public"."councils"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_registration_id_scout_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."scout_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_application_id_scout_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."scout_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;