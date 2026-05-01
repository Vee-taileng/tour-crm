import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { updateBooking } from "../actions";
import type { BookingWithRelations, PickupLocation } from "@/types/database";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: bookingRaw }, { data: locations }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, clients(*), tours(*, tour_providers(*)), pickup_locations(*)")
      .eq("id", id)
      .single(),
    supabase.from("pickup_locations").select("*").eq("isActive", true).order("name"),
  ]);

  if (!bookingRaw) notFound();

  const booking = bookingRaw as unknown as BookingWithRelations;
  const locs = (locations ?? []) as PickupLocation[];
  const updateAction = updateBooking.bind(null, id);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/bookings" className="hover:text-gray-700">
          Bookings
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">{booking.bookingRef}</span>
      </div>

      <div className="flex items-start justify-between">
        <PageHeader
          title={booking.bookingRef}
          description={`Created ${formatDate(booking.bookingDate)}`}
        />
        <div className="flex items-center gap-3">
          <PaymentBadge status={booking.paymentStatus} />
          <BookingBadge status={booking.bookingStatus} />
          <a
            href={`/api/bookings/${id}/receipt`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Receipt
          </a>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Summary</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Client</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              <Link href={`/clients/${booking.clientId}`} className="text-orange-600 hover:underline">
                {booking.clients?.fullName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Tour</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              <Link href={`/tours/${booking.tourId}`} className="text-orange-600 hover:underline">
                {booking.tours?.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Tour Date</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{formatDate(booking.tourDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Departure</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{booking.departureTime ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Pax</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {booking.adultPax}A / {booking.childPax}C / {booking.infantPax}I
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Pickup</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {booking.pickup_locations?.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Total</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{formatCurrency(booking.totalAmount)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Net Revenue</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{formatCurrency(booking.netAmount)}</dd>
          </div>
        </dl>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-medium text-gray-900 mb-4">Edit Booking</h2>
        {/* hidden tourId needed for server action to recalculate */}
        <form action={updateAction} className="space-y-4">
          <input type="hidden" name="tourId" value={booking.tourId} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tour Date</label>
              <input type="date" name="tourDate" defaultValue={booking.tourDate} required className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
              {booking.tours?.departureTimes && booking.tours.departureTimes.length > 0 ? (
                <select name="departureTime" defaultValue={booking.departureTime ?? ""} className={INPUT}>
                  <option value="">Any time</option>
                  {booking.tours.departureTimes.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input name="departureTime" defaultValue={booking.departureTime ?? ""} className={INPUT} />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
              <input type="number" name="adultPax" defaultValue={booking.adultPax} min="0" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
              <input type="number" name="childPax" defaultValue={booking.childPax} min="0" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Infants</label>
              <input type="number" name="infantPax" defaultValue={booking.infantPax} min="0" className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <select name="pickupLocationId" defaultValue={booking.pickupLocationId ?? ""} className={INPUT}>
                <option value="">No pickup</option>
                {locs.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}{l.zone ? ` (${l.zone})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
              <input name="hotelName" defaultValue={booking.hotelName ?? ""} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input name="hotelRoom" defaultValue={booking.hotelRoom ?? ""} className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
              <select name="bookingStatus" defaultValue={booking.bookingStatus} className={INPUT}>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Source</label>
              <select name="bookingSource" defaultValue={booking.bookingSource ?? ""} className={INPUT}>
                <option value="">Unknown</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="WEBSITE">Website</option>
                <option value="PARTNER">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select name="paymentStatus" defaultValue={booking.paymentStatus} className={INPUT}>
                <option value="UNPAID">Unpaid</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received (฿)</label>
              <input
                type="number"
                name="amountReceived"
                defaultValue={booking.amountReceived ?? ""}
                min="0"
                step="0.01"
                className={INPUT}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              defaultValue={booking.notes ?? ""}
              rows={3}
              className={`${INPUT} resize-none`}
            />
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </form>
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
