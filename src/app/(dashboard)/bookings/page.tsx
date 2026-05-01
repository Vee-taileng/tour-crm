import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { BookingWithRelations, BookingStatus, PaymentStatus } from "@/types/database";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; date?: string }>;
}) {
  const { status, payment, date } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*, clients(*), tours(*), pickup_locations(*)")
    .order("tourDate", { ascending: false });

  if (status) query = query.eq("bookingStatus", status as BookingStatus);
  if (payment) query = query.eq("paymentStatus", payment as PaymentStatus);
  if (date) query = query.eq("tourDate", date);

  const { data } = await query;
  const bookings = (data ?? []) as unknown as BookingWithRelations[];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Bookings"
        description="All client bookings"
        className="mb-6"
        action={
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </Link>
        }
      />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 mb-4">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </select>
        <select
          name="payment"
          defaultValue={payment ?? ""}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Payments</option>
          <option value="UNPAID">Unpaid</option>
          <option value="DEPOSIT">Deposit</option>
          <option value="PAID">Paid</option>
        </select>
        <input
          type="date"
          name="date"
          defaultValue={date ?? ""}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Filter
        </button>
        {(status || payment || date) && (
          <Link
            href="/bookings"
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ref</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tour</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Pax</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-500">{b.bookingRef}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.clients?.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{b.tours?.name}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(b.tourDate)}</td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {b.adultPax + b.childPax + b.infantPax}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 whitespace-nowrap">
                    {formatCurrency(b.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={b.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <BookingBadge status={b.bookingStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/bookings/${b.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">No bookings found.</div>
        )}
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "PAID") return <Badge variant="green">Paid</Badge>;
  if (status === "DEPOSIT") return <Badge variant="yellow">Deposit</Badge>;
  return <Badge variant="gray">Unpaid</Badge>;
}

function BookingBadge({ status }: { status: string }) {
  if (status === "CONFIRMED") return <Badge variant="green">Confirmed</Badge>;
  if (status === "PENDING") return <Badge variant="yellow">Pending</Badge>;
  if (status === "CANCELLED") return <Badge variant="red">Cancelled</Badge>;
  return <Badge variant="gray">No Show</Badge>;
}
