ALTER TABLE "councils" ALTER COLUMN "region_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "councils" ADD COLUMN "council_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ADD COLUMN "region_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_region_number_unique" UNIQUE("region_number");