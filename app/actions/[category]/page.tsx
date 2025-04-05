import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionCard } from "@/components/action-card";

const categoryToChain = {
  "based-actions": "BASE",
  "stable-actions": "CELO",
  "global-actions": "ETHEREUM",
} as const;

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const chain =
    categoryToChain[params.category as keyof typeof categoryToChain];

  if (!chain) {
    notFound();
  }

  const actions = await db.select().from(action).where(eq(action.chain, chain));

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">
        {params.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}
