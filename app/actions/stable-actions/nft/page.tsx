import { CeloNftAction } from "@/components/actions/celo-nft-action";

export default function CeloNftPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mint Celo NFT</h1>
      <div className="max-w-2xl mx-auto">
        <CeloNftAction />
      </div>
    </div>
  );
}
