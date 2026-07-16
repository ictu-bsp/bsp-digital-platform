ALTER TABLE "activities" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."activity_category";--> statement-breakpoint
CREATE TYPE "public"."activity_category" AS ENUM('COUNCIL', 'REGIONAL', 'NATIONAL');--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "category" SET DATA TYPE "public"."activity_category" USING "category"::"public"."activity_category";--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN "scope";--> statement-breakpoint
DROP TYPE "public"."activity_scope";