import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function TransfersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("provider_transfers")
    .select("*, tour_providers(*), banks(*)")
    .order("transferDate", { ascending: false });

  const transfers = (data ?? []) as unknown as Array<{
    id: string;
    transferDate: string;
    amount: number;
    referenceNo: string | null;
    notes: string | null;
    bookingIds: string[];
    createdAt: string;
    tour_providers: { name: string } | null;
    banks: { bankName: string; accountName: string } | null;
  }>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Provider Transfers"
        description="Log and track payments to tour providers"
        className="mb-6"
        action={
          <Link
            href="/transfers/new"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Transfer
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {transfers.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Provider</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Bank Account</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Bookings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(t.transferDate)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {t.tour_providers?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.banks
                      ? `${t.banks.bankName} · ${t.banks.accountName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {t.referenceNo ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {t.bookingIds.length > 0 ? t.bookingIds.length : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">No transfers logged yet.</div>
        )}
      </div>
    </div>
  );
}
