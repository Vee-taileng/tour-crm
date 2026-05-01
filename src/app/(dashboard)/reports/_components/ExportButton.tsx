"use client";

import { Download } from "lucide-react";

export type ReportRow = {
  bookingRef: string;
  bookingDate: string;
  clientName: string;
  tourName: string;
  tourDate: string;
  adultPax: number;
  childPax: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  amountReceived: number;
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
};

function escapeCell(v: string | number): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function buildCSV(rows: ReportRow[], period: string): string {
  const [year, month] = period.split("-");
  const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const headers = [
    "Ref",
    "Booked Date",
    "Client",
    "Tour",
    "Tour Date",
    "Adults",
    "Price/Adult (THB)",
    "Children",
    "Price/Child (THB)",
    "Total Paid (THB)",
    "Revenue (THB)",
    "Commission (THB)",
    "Net (THB)",
  ];

  const dataRows = rows.map((r) =>
    [
      r.bookingRef,
      r.bookingDate,
      r.clientName,
      r.tourName,
      r.tourDate,
      r.adultPax,
      r.adultUnitPrice,
      r.childPax,
      r.childUnitPrice,
      r.amountReceived,
      r.totalAmount,
      r.commissionAmount,
      r.netAmount,
    ].map(escapeCell)
  );

  const totals = [
    "TOTAL",
    label,
    "",
    "",
    "",
    rows.reduce((s, r) => s + r.adultPax, 0),
    "",
    rows.reduce((s, r) => s + r.childPax, 0),
    "",
    rows.reduce((s, r) => s + r.amountReceived, 0),
    rows.reduce((s, r) => s + r.totalAmount, 0),
    rows.reduce((s, r) => s + r.commissionAmount, 0),
    rows.reduce((s, r) => s + r.netAmount, 0),
  ].map(escapeCell);

  return [headers.map(escapeCell).join(","), ...dataRows.map((r) => r.join(",")), totals.join(",")].join(
    "\n"
  );
}

export default function ExportButton({ rows, period }: { rows: ReportRow[]; period: string }) {
  function handleExport() {
    const csv = buildCSV(rows, period);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
