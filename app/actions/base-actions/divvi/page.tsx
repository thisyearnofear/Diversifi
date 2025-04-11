import { DivviRegistrationAction } from "@/components/actions/divvi-registration";

export default function DivviRegistrationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Register with Divvi V0</h1>
      <div className="max-w-2xl mx-auto">
        <DivviRegistrationAction />
      </div>
    </div>
  );
}
