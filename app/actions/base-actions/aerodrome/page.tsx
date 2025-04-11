import { AerodromeSwapAction } from "@/components/actions/aerodrome-swap";

export default function AerodromeSwapPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Swap to USDbC on Aerodrome</h1>
      <div className="max-w-2xl mx-auto">
        <AerodromeSwapAction />
      </div>
    </div>
  );
}
