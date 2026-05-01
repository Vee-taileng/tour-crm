"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, X, AlertCircle } from "lucide-react";
import { bulkCreateTours } from "../actions";
import type { TourProvider } from "@/types/database";

const REQUIRED = ["name", "tourType", "duration", "adultPrice"] as const;

type RawRow = Record<string, string>;
type ParsedRow = {
  name: string;
  tourType: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  commissionType: string;
  adultCommissionValue: number;
  childCommissionValue: number;
  status: string;
};

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

export default function TourCSVImport({ providers }: { providers: TourProvider[] }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [providerId, setProviderId] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setErrors([]);
    setRows([]);
    setDone(false);

    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const errs: string[] = [];

        REQUIRED.forEach((col) => {
          if (!result.meta.fields?.includes(col)) {
            errs.push(`Missing required column: "${col}"`);
          }
        });

        if (errs.length) {
          setErrors(errs);
          return;
        }

        const parsed: ParsedRow[] = result.data.map((r, i) => {
          if (!r.name?.trim()) errs.push(`Row ${i + 2}: name is empty`);
          if (!r.tourType?.trim()) errs.push(`Row ${i + 2}: tourType is empty`);
          if (!r.duration?.trim()) errs.push(`Row ${i + 2}: duration is empty`);
          return {
            name: r.name?.trim() ?? "",
            tourType: r.tourType?.trim() ?? "",
            duration: r.duration?.trim() ?? "",
            adultPrice: Number(r.adultPrice) || 0,
            childPrice: Number(r.childPrice) || 0,
            infantPrice: Number(r.infantPrice) || 0,
            commissionType: r.commissionType?.trim() || "FIXED",
            adultCommissionValue: Number(r.adultCommissionValue) || 0,
            childCommissionValue: Number(r.childCommissionValue) || 0,
            status: r.status?.trim() || "DRAFT",
          };
        });

        setErrors(errs);
        if (!errs.length) setRows(parsed);
      },
    });
  }

  async function handleImport() {
    if (!providerId || !rows.length) return;
    setImporting(true);
    try {
      await bulkCreateTours(providerId, rows);
      setDone(true);
      setRows([]);
    } catch (e) {
      setErrors([(e as Error).message]);
    }
    setImporting(false);
  }

  function reset() {
    setOpen(false);
    setRows([]);
    setErrors([]);
    setProviderId("");
    setDone(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Import Tours from CSV</h2>
              <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {done ? (
                <div className="text-center py-8">
                  <p className="text-green-600 font-medium mb-1">
                    {rows.length === 0 ? "Tours imported successfully!" : ""}
                    Import complete.
                  </p>
                  <p className="text-sm text-gray-500">The tours page has been updated.</p>
                </div>
              ) : (
                <>
                  {/* Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-700">Required columns:</p>
                    <p><code className="bg-white border border-gray-200 px-1 rounded">name</code>, <code className="bg-white border border-gray-200 px-1 rounded">tourType</code>, <code className="bg-white border border-gray-200 px-1 rounded">duration</code>, <code className="bg-white border border-gray-200 px-1 rounded">adultPrice</code></p>
                    <p className="font-medium text-gray-700 pt-1">Optional columns:</p>
                    <p><code className="bg-white border border-gray-200 px-1 rounded">childPrice</code>, <code className="bg-white border border-gray-200 px-1 rounded">infantPrice</code>, <code className="bg-white border border-gray-200 px-1 rounded">commissionType</code> (FIXED/PERCENTAGE), <code className="bg-white border border-gray-200 px-1 rounded">adultCommissionValue</code>, <code className="bg-white border border-gray-200 px-1 rounded">childCommissionValue</code>, <code className="bg-white border border-gray-200 px-1 rounded">status</code> (DRAFT/ACTIVE)</p>
                    <p className="pt-1 text-xs text-gray-400">tourType values: ELEPHANTS, BAMBOO_RAFTING, COOKING_CLASS, MUAY_THAI, TEMPLE_TOUR, WATERFALLS</p>
                  </div>

                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign to Provider <span className="text-red-500">*</span>
                    </label>
                    <select
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

                  {/* File picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                      className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:text-gray-600 file:bg-white hover:file:bg-gray-50"
                    />
                  </div>

                  {/* Errors */}
                  {errors.length > 0 && (
                    <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <ul className="space-y-0.5">
                        {errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Preview */}
                  {rows.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview — {rows.length} tour{rows.length !== 1 ? "s" : ""}
                      </p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Duration</th>
                              <th className="text-right px-3 py-2 font-medium text-gray-600">Adult ฿</th>
                              <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {rows.slice(0, 8).map((r, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-gray-900">{r.name}</td>
                                <td className="px-3 py-2 text-gray-600">{r.tourType}</td>
                                <td className="px-3 py-2 text-gray-600">{r.duration}</td>
                                <td className="px-3 py-2 text-right text-gray-900">{r.adultPrice}</td>
                                <td className="px-3 py-2 text-gray-500">{r.status}</td>
                              </tr>
                            ))}
                            {rows.length > 8 && (
                              <tr>
                                <td colSpan={5} className="px-3 py-2 text-center text-gray-400">
                                  +{rows.length - 8} more rows…
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {done ? (
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              ) : (
                <>
                  <button onClick={reset} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!providerId || rows.length === 0 || importing}
                    className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? "Importing…" : `Import ${rows.length} tour${rows.length !== 1 ? "s" : ""}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
