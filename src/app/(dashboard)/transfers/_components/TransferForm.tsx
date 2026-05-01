"use client";

import { useState } from "react";
import Link from "next/link";
import { createTransfer } from "../actions";
import type { TourProvider, Bank } from "@/types/database";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

type Props = {
  providers: TourProvider[];
  banks: Bank[];
};

export default function TransferForm({ providers, banks }: Props) {
  const [providerId, setProviderId] = useState("");

  const providerBanks = banks.filter((b) => b.providerId === providerId);

  return (
    <form action={createTransfer} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            name="providerId"
            required
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className={INPUT}
          >
            <option value="">Select provider…</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <select name="bankId" required disabled={!providerId} className={INPUT}>
            <option value="">
              {providerId ? "Select bank…" : "Select provider first"}
            </option>
            {providerBanks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bankName} · {b.accountName} ({b.accountNo})
                {b.isPrimary ? " ★" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transfer Date <span className="text-red-500">*</span>
          </label>
          <input type="date" name="transferDate" required className={INPUT} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (฿) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className={INPUT}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference No.</label>
          <input name="referenceNo" placeholder="e.g. bank slip number" className={INPUT} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking IDs (comma-separated)
          </label>
          <input
            name="bookingIds"
            placeholder="optional — e.g. TMS-2026-0001, TMS-2026-0002"
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={3} className={`${INPUT} resize-none`} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Log Transfer
        </button>
        <Link
          href="/transfers"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
