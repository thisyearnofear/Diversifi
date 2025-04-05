import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { type action } from "@/lib/db/schema";

interface ActionCardProps {
  action: typeof action.$inferSelect;
}

interface Step {
  title: string;
  description: string;
  link?: string;
}

interface Reward {
  type: "TOKEN" | "NFT" | "ENS" | "SOCIAL" | "OTHER";
  description: string;
}

export function ActionCard({ action }: ActionCardProps) {
  const steps = action.steps as Step[];
  const rewards = action.rewards as Reward[];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "rounded-lg border p-6 transition-colors",
        "hover:shadow-md",
        {
          "border-blue-200 bg-blue-50": action.chain === "BASE",
          "border-yellow-200 bg-yellow-50": action.chain === "CELO",
          "border-purple-200 bg-purple-50": action.chain === "ETHEREUM",
        }
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{action.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{action.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
            {action.difficulty}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Steps:</h4>
        <ul className="space-y-2">
          {steps.map((step: Step, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <Circle className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-xs text-blue-500 hover:underline"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Rewards:</h4>
        <ul className="mt-2 space-y-1">
          {rewards.map((reward: Reward, index: number) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{reward.description}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600">
        Start Action
      </button>
    </motion.div>
  );
}
