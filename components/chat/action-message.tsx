"use client";

import { useState } from "react";
import { ActionCardCompact } from "./action-card-compact";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ActionMessageProps {
  actions: {
    title: string;
    description: string;
    chain: string;
    difficulty: string;
    steps: string[];
    reward: string;
    actionUrl: string;
    proofFieldLabel?: string;
    proofFieldPlaceholder?: string;
  }[];
  onComplete?: () => void;
}

export function ActionMessage({ actions, onComplete }: ActionMessageProps) {
  const [showAll, setShowAll] = useState(false);
  
  // If there's only one action or showAll is true, show all actions
  // Otherwise, show only the first action
  const visibleActions = showAll ? actions : actions.slice(0, 1);
  
  return (
    <div className="flex flex-col w-full">
      <div className="mb-2 text-sm font-medium">
        {actions.length === 1 
          ? "I recommend this action:" 
          : "I recommend these actions:"}
      </div>
      
      {visibleActions.map((action, index) => (
        <ActionCardCompact
          key={index}
          {...action}
          onComplete={onComplete}
        />
      ))}
      
      {actions.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="self-center mt-2"
        >
          {showAll ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Show fewer actions
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show {actions.length - 1} more {actions.length - 1 === 1 ? "action" : "actions"}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
