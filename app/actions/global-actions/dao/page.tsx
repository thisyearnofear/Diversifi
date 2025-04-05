import { DaoAction } from "@/components/actions/dao-action";

export default function DaoPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Participate in DAO</h1>
      <div className="max-w-2xl mx-auto">
        <DaoAction />
      </div>
    </div>
  );
}
