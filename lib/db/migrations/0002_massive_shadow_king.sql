CREATE TABLE IF NOT EXISTS "Wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(42) NOT NULL,
	"walletId" text NOT NULL,
	"address" varchar(42) NOT NULL,
	"network" varchar(50) NOT NULL,
	"createdAt" timestamp NOT NULL,
	"lastFundedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
