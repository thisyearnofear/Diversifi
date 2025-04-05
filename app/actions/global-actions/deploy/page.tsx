import { DeployContractAction } from "@/components/actions/deploy-contract-action";

export default function DeployContractPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Deploy Smart Contract</h1>
      <div className="max-w-2xl mx-auto">
        <DeployContractAction />
      </div>
    </div>
  );
}
