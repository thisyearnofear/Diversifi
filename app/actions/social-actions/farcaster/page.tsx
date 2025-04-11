import { FarcasterAction } from "@/components/actions/farcaster-action";

export default function FarcasterPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Set up Farcaster Account</h1>
      <div className="max-w-2xl mx-auto">
        <FarcasterAction />
      </div>
    </div>
  );
}
