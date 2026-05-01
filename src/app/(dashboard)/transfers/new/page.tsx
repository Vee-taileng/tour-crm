import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import TransferForm from "../_components/TransferForm";

export default async function NewTransferPage() {
  const supabase = await createClient();
  const [{ data: providers }, { data: banks }] = await Promise.all([
    supabase.from("tour_providers").select("*").eq("isActive", true).order("name"),
    supabase.from("banks").select("*").order("isPrimary", { ascending: false }),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <Link href="/transfers" className="hover:text-gray-700">
          Transfers
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">Log Transfer</span>
      </div>
      <PageHeader title="Log Transfer" description="Record a payment made to a provider" className="mb-6" />
      <TransferForm providers={providers ?? []} banks={banks ?? []} />
    </div>
  );
}
