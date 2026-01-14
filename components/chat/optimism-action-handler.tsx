'use client';

interface OptimismActionHandlerProps {
  args: any[];
}

export function OptimismActionHandler({ args }: OptimismActionHandlerProps) {
  return (
    <div className="my-4 w-full">
      <p className="text-sm text-gray-600">Optimism actions are currently handled by the main agent.</p>
    </div>
  );
}
