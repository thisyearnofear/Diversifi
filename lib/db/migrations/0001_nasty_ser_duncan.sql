CREATE TABLE IF NOT EXISTS "Action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"chain" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"prerequisites" json[],
	"steps" json[],
	"rewards" json[],
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserAction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(42) NOT NULL,
	"actionId" uuid NOT NULL,
	"status" varchar DEFAULT 'NOT_STARTED' NOT NULL,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"proof" json,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserReward" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(42) NOT NULL,
	"actionId" uuid NOT NULL,
	"type" varchar NOT NULL,
	"details" json NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimedAt" timestamp,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_actionId_Action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."Action"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserReward" ADD CONSTRAINT "UserReward_actionId_Action_id_fk" FOREIGN KEY ("actionId") REFERENCES "public"."Action"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
