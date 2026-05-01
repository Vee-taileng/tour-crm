"use client";

import { useState } from "react";
import Link from "next/link";
import { createBooking } from "../actions";
import { formatCurrency, calculateCommission } from "@/lib/utils";
import type { Tour, PickupLocation } from "@/types/database";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

type Props = {
  tours: Tour[];
  locations: PickupLocation[];
};

export default function NewBookingForm({ tours, locations }: Props) {
  const [tourId, setTourId] = useState("");
  const [adultPax, setAdultPax] = useState(1);
  const [childPax, setChildPax] = useState(0);
  const [infantPax, setInfantPax] = useState(0);

  const tour = tours.find((t) => t.id === tourId);
  const adultAmount = adultPax * (tour?.adultPrice ?? 0);
  const childAmount = childPax * (tour?.childPrice ?? 0);
  const infantAmount = infantPax * (tour?.infantPrice ?? 0);
  const total = adultAmount + childAmount + infantAmount;
  const commission = tour
    ? calculateCommission(
        tour.commissionType,
        tour.adultCommissionValue,
        tour.childCommissionValue,
        adultPax,
        adultAmount,
        childPax,
        childAmount,
      )
    : 0;
  const net = total - commission;

  return (
    <form action={createBooking} className="space-y-6">
      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Client</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input name="clientName" required placeholder="e.g. James Harrington" className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input name="clientPhone" required placeholder="+66 81 234 5678" className={INPUT} />
          </div>
        </div>
      </div>

      {/* Tour */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Tour</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tour <span className="text-red-500">*</span>
          </label>
          <select
            name="tourId"
            required
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className={INPUT}
          >
            <option value="">Select tour…</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date & Departure */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Date & Departure</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Date <span className="text-red-500">*</span>
            </label>
            <input type="date" name="tourDate" required className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
            {tour && tour.departureTimes.length > 0 ? (
              <select name="departureTime" className={INPUT}>
                <option value="">Any time</option>
                {tour.departureTimes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <input type="text" name="departureTime" placeholder="e.g. 07:30" className={INPUT} />
            )}
          </div>
        </div>
      </div>

      {/* Passengers & Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Passengers</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
            <input
              type="number"
              name="adultPax"
              min="0"
              value={adultPax}
              onChange={(e) => setAdultPax(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
            <input
              type="number"
              name="childPax"
              min="0"
              value={childPax}
              onChange={(e) => setChildPax(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Infants</label>
            <input
              type="number"
              name="infantPax"
              min="0"
              value={infantPax}
              onChange={(e) => setInfantPax(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
          </div>
        </div>

        {tour && (
          <div className="p-4 bg-gray-50 rounded-lg text-sm space-y-1.5">
            {adultPax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Adults: {adultPax} × {formatCurrency(tour.adultPrice)}</span>
                <span>{formatCurrency(adultAmount)}</span>
              </div>
            )}
            {childPax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Children: {childPax} × {formatCurrency(tour.childPrice)}</span>
                <span>{formatCurrency(childAmount)}</span>
              </div>
            )}
            {infantPax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Infants: {infantPax} × {formatCurrency(tour.infantPrice)}</span>
                <span>{formatCurrency(infantAmount)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-1.5 flex justify-between font-medium text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>
                Commission (
                {tour.commissionType === "PERCENTAGE"
                  ? `Adult ${tour.adultCommissionValue}% / Child ${tour.childCommissionValue}%`
                  : `Adult ${formatCurrency(tour.adultCommissionValue)} / Child ${formatCurrency(tour.childCommissionValue)} per pax`}
                )
              </span>
              <span>−{formatCurrency(commission)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Net revenue</span>
              <span>{formatCurrency(net)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pickup & Hotel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Pickup & Hotel</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
            <select name="pickupLocationId" className={INPUT}>
              <option value="">No pickup</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.zone ? ` (${l.zone})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
            <input name="hotelName" className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input name="hotelRoom" className={INPUT} />
          </div>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Status & Payment</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
            <select name="bookingStatus" defaultValue="PENDING" className={INPUT}>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Source</label>
            <select name="bookingSource" className={INPUT}>
              <option value="">Unknown</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="WEBSITE">Website</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select name="paymentStatus" defaultValue="UNPAID" className={INPUT}>
              <option value="UNPAID">Unpaid</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received (฿)</label>
            <input type="number" name="amountReceived" min="0" step="0.01" className={INPUT} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" rows={3} className={`${INPUT} resize-none`} />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Create Booking
        </button>
        <Link
          href="/bookings"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
