"use client";

import { useState } from "react";
import { addBankAccount, updateBankAccount, deleteBankAccount, setPrimaryBank } from "../actions";
import type { Bank } from "@/types/database";
import Badge from "@/components/ui/Badge";
import { Star, Trash2, Plus, Pencil, X } from "lucide-react";

const THAI_BANKS = [
  "Kasikorn Bank (KBank)",
  "Bangkok Bank",
  "SCB (Siam Commercial Bank)",
  "Krungsri (Bank of Ayudhya)",
  "Krungthai Bank",
  "TMBThanachart Bank (ttb)",
  "Government Savings Bank (GSB)",
  "Krung Thai Bank",
  "CIMB Thai",
  "Other",
];

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white";

function BankRow({
  bank,
  providerId,
}: {
  bank: Bank;
  providerId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [isPrimary, setIsPrimary] = useState(bank.isPrimary);

  const editAction = updateBankAccount.bind(null, bank.id, providerId);

  if (editing) {
    return (
      <form
        action={async (fd) => {
          await editAction(fd);
          setEditing(false);
        }}
        className="px-4 py-3 space-y-3 bg-orange-50"
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-gray-600">Edit Bank Account</p>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
          <select name="bankName" defaultValue={bank.bankName} required className={INPUT}>
            <option value="">Select bank…</option>
            {THAI_BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
            <input
              name="accountName"
              defaultValue={bank.accountName}
              required
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
            <input
              name="accountNo"
              defaultValue={bank.accountNo}
              required
              className={INPUT}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="isPrimary"
            value="true"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          Set as primary bank account
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{bank.bankName}</span>
          {bank.isPrimary && <Badge variant="orange">Primary</Badge>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {bank.accountName} · {bank.accountNo}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Edit"
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-orange-600 rounded transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {!bank.isPrimary && (
          <form action={setPrimaryBank.bind(null, bank.id, providerId)}>
            <button
              type="submit"
              title="Set as primary"
              className="p-1.5 text-gray-400 hover:text-orange-600 rounded transition-colors"
            >
              <Star className="w-4 h-4" />
            </button>
          </form>
        )}
        <form action={deleteBankAccount.bind(null, bank.id, providerId)}>
          <button
            type="submit"
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
            onClick={(e) => {
              if (!confirm("Delete this bank account?")) e.preventDefault();
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BankAccountsSection({
  providerId,
  banks,
}: {
  providerId: string;
  banks: Bank[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPrimary, setIsPrimary] = useState(banks.length === 0);

  const addAction = addBankAccount.bind(null, providerId);

  return (
    <div className="space-y-3">
      {banks.length > 0 ? (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {banks.map((bank) => (
            <BankRow key={bank.id} bank={bank} providerId={providerId} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No bank accounts added yet.</p>
      )}

      {showForm ? (
        <form
          action={async (fd) => {
            await addAction(fd);
            setShowForm(false);
          }}
          className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-700">Add Bank Account</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name</label>
            <select name="bankName" required className={INPUT}>
              <option value="">Select bank…</option>
              {THAI_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account Name</label>
              <input
                name="accountName"
                required
                className={INPUT}
                placeholder="Account holder name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account Number</label>
              <input
                name="accountNo"
                required
                className={INPUT}
                placeholder="xxx-x-xxxxx-x"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="isPrimary"
              value="true"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            Set as primary bank account
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Add Account
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add bank account
        </button>
      )}
    </div>
  );
}
