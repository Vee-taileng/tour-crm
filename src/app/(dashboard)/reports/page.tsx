import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import ExportButton, { type ReportRow } from "./_components/ExportButton";
import PeriodPicker from "./_components/PeriodPicker";

type ReportBooking = {
  bookingRef: string;
  bookingDate: string;
  tourDate: string;
  adultPax: number;
  childPax: number;
  infantPax: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  amountReceived: number | null;
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
  clients: { fullName: string } | null;
  tours: { name: string } | null;
};

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = period ?? currentPeriod();

  const [yearStr, monthStr] = activePeriod.split("-");
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);
  const startDate = `${yearStr}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  const periodLabel = new Date(year, month - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, clients(fullName), tours(name)")
    .gte("tourDate", startDate)
    .lte("tourDate", endDate)
    .in("bookingStatus", ["CONFIRMED", "PENDING"])
    .order("tourDate", { ascending: true });

  const bookings = (data ?? []) as unknown as ReportBooking[];

  const totals = bookings.reduce(
    (acc, b) => ({
      count: acc.count + 1,
      adultPax: acc.adultPax + b.adultPax,
      childPax: acc.childPax + b.childPax,
      paid: acc.paid + (b.amountReceived ?? 0),
      revenue: acc.revenue + b.totalAmount,
      commission: acc.commission + b.commissionAmount,
      net: acc.net + b.netAmount,
    }),
    { count: 0, adultPax: 0, childPax: 0, paid: 0, revenue: 0, commission: 0, net: 0 }
  );

  const exportRows: ReportRow[] = bookings.map((b) => ({
    bookingRef: b.bookingRef,
    bookingDate: b.bookingDate,
    clientName: b.clients?.fullName ?? "",
    tourName: b.tours?.name ?? "",
    tourDate: b.tourDate,
    adultPax: b.adultPax,
    childPax: b.childPax,
    adultUnitPrice: b.adultUnitPrice,
    childUnitPrice: b.childUnitPrice,
    amountReceived: b.amountReceived ?? 0,
    totalAmount: b.totalAmount,
    commissionAmount: b.commissionAmount,
    netAmount: b.netAmount,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title="Financial Report"
          description={`Confirmed & pending bookings by tour date — ${periodLabel}`}
        />
        <div className="flex items-center gap-2 mt-1">
          <PeriodPicker value={activePeriod} />
          <ExportButton rows={exportRows} period={activePeriod} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Bookings" value={String(totals.count)} />
        <SummaryCard label="Revenue" value={formatCurrency(totals.revenue)} highlight />
        <SummaryCard label="Commission" value={formatCurrency(totals.commission)} />
        <SummaryCard label="Net Revenue" value={formatCurrency(totals.net)} highlight />
      </div>

      {/* Report table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ref</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Booked Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tour</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tour Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Adults</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Price/Adult</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Children</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Price/Child</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total Paid</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b.bookingRef} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.bookingRef}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.bookingDate)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.clients?.fullName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.tours?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.tourDate)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{b.adultPax}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(b.adultUnitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{b.childPax}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formatCurrency(b.childUnitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {formatCurrency(b.amountReceived ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-600">
                      {formatCurrency(b.commissionAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">
                      {formatCurrency(b.netAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td colSpan={5} className="px-4 py-3 text-gray-700">
                    Total — {totals.count} booking{totals.count !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">{totals.adultPax}</td>
                  <td />
                  <td className="px-4 py-3 text-right text-gray-900">{totals.childPax}</td>
                  <td />
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(totals.paid)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(totals.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600">
                    {formatCurrency(totals.commission)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700">
                    {formatCurrency(totals.net)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">
            No confirmed bookings for {periodLabel}.
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${highlight ? "text-gray-900" : "text-gray-700"}`}>
        {value}
      </p>
    </div>
  );
}
