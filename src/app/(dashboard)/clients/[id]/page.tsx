import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { updateClientRecord } from "../actions";
import type { BookingWithRelations } from "@/types/database";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: bookingsRaw }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("bookings")
      .select("*, tours(*, tour_providers(*)), pickup_locations(*)")
      .eq("clientId", id)
      .order("tourDate", { ascending: false }),
  ]);

  if (!client) notFound();

  const bookings = (bookingsRaw ?? []) as unknown as Omit<BookingWithRelations, "clients">[];
  const updateAction = updateClientRecord.bind(null, id);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/clients" className="hover:text-gray-700">
          Clients
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">{client.fullName}</span>
      </div>

      <div className="flex items-center justify-between">
        <PageHeader
          title={client.fullName}
          description={client.isRepeat ? "Repeat client" : "New client"}
        />
        {client.isRepeat && <Badge variant="orange">Repeat</Badge>}
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Details</h2>
        <form action={updateAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input name="fullName" defaultValue={client.fullName} required className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input name="whatsapp" defaultValue={client.whatsapp} required className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" defaultValue={client.email ?? ""} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input name="nationality" defaultValue={client.nationality ?? ""} className={INPUT} />
            </div>
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Booking history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Bookings</h2>
          <Link
            href={`/bookings/new?clientId=${client.id}`}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            + New Booking
          </Link>
        </div>
        {bookings.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Ref</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Tour</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link href={`/bookings/${b.id}`} className="text-orange-600 hover:underline font-mono text-xs">
                      {b.bookingRef}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{b.tours?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-gray-500">{formatDate(b.tourDate)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-4 py-2.5">
                    <BookingStatusBadge status={b.bookingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-gray-400 text-center">No bookings yet.</p>
        )}
      </div>
    </div>
  );
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "green" | "yellow" | "red" | "gray"; label: string }> = {
    CONFIRMED: { variant: "green", label: "Confirmed" },
    PENDING: { variant: "yellow", label: "Pending" },
    CANCELLED: { variant: "red", label: "Cancelled" },
    NO_SHOW: { variant: "gray", label: "No Show" },
  };
  const { variant, label } = map[status] ?? { variant: "gray", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
