import { UbeswapSwapAction } from "@/components/actions/ubeswap-swap";

export default function UbeswapSwapPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Swap on Ubeswap</h1>
      <div className="max-w-2xl mx-auto">
        <UbeswapSwapAction />
      </div>
    </div>
  );
}
