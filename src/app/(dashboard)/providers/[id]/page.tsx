import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import ProviderForm from "./ProviderForm";
import BankAccountsSection from "./BankAccountsSection";
import DeleteProviderButton from "./DeleteProviderButton";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: provider }, { data: banks }] = await Promise.all([
    supabase.from("tour_providers").select("*").eq("id", id).single(),
    supabase.from("banks").select("*").eq("providerId", id).order("isPrimary", { ascending: false }),
  ]);

  if (!provider) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/providers"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Providers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title={provider.name}
          action={
            <Badge variant={provider.isActive ? "green" : "gray"}>
              {provider.isActive ? "Active" : "Inactive"}
            </Badge>
          }
        />
        <DeleteProviderButton id={id} />
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Provider Details</h2>
          <ProviderForm provider={provider} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Bank Accounts</h2>
          <BankAccountsSection providerId={id} banks={banks ?? []} />
        </div>
      </div>
    </div>
  );
}
