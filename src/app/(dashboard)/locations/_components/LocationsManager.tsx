"use client";

import { useState } from "react";
import { Plus, Pencil, Check, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { addLocation, updateLocation, toggleLocation } from "../actions";
import type { PickupLocation } from "@/types/database";

const INPUT =
  "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

export default function LocationsManager({ locations }: { locations: PickupLocation[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Zone</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 w-32" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {locations.map((loc) =>
            editingId === loc.id ? (
              <EditRow key={loc.id} location={loc} onDone={() => setEditingId(null)} />
            ) : (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{loc.name}</td>
                <td className="px-4 py-3 text-gray-500">{loc.zone ?? "—"}</td>
                <td className="px-4 py-3">
                  {loc.isActive ? (
                    <Badge variant="green">Active</Badge>
                  ) : (
                    <Badge variant="gray">Inactive</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setEditingId(loc.id)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <form
                      action={toggleLocation.bind(null, loc.id, !loc.isActive)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {loc.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            )
          )}

          {/* Add row */}
          {showAdd && <AddRow onDone={() => setShowAdd(false)} />}
        </tbody>
      </table>

      {!showAdd && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      )}
    </div>
  );
}

function EditRow({
  location,
  onDone,
}: {
  location: PickupLocation;
  onDone: () => void;
}) {
  const action = async (formData: FormData) => {
    await updateLocation(location.id, formData);
    onDone();
  };
  return (
    <tr className="bg-orange-50">
      <td className="px-4 py-2">
        <form id={`edit-${location.id}`} action={action} />
        <input
          form={`edit-${location.id}`}
          name="name"
          defaultValue={location.name}
          className={INPUT}
          autoFocus
        />
      </td>
      <td className="px-4 py-2">
        <input
          form={`edit-${location.id}`}
          name="zone"
          defaultValue={location.zone ?? ""}
          placeholder="Zone"
          className={INPUT}
        />
      </td>
      <td className="px-4 py-2" />
      <td className="px-4 py-2">
        <div className="flex items-center justify-end gap-2">
          <button
            form={`edit-${location.id}`}
            type="submit"
            className="text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDone} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddRow({ onDone }: { onDone: () => void }) {
  const action = async (formData: FormData) => {
    await addLocation(formData);
    onDone();
  };
  return (
    <tr className="bg-orange-50">
      <td className="px-4 py-2">
        <form id="add-location" action={action} />
        <input
          form="add-location"
          name="name"
          placeholder="Location name"
          required
          className={INPUT}
          autoFocus
        />
      </td>
      <td className="px-4 py-2">
        <input
          form="add-location"
          name="zone"
          placeholder="Zone (optional)"
          className={INPUT}
        />
      </td>
      <td className="px-4 py-2" />
      <td className="px-4 py-2">
        <div className="flex items-center justify-end gap-2">
          <button
            form="add-location"
            type="submit"
            className="text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDone} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
