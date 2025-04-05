import { BridgeAction } from "@/components/actions/bridge-action";

export default function BridgePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Bridge to Base</h1>
      <div className="max-w-2xl mx-auto">
        <BridgeAction />
      </div>
    </div>
  );
}
