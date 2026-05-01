"use client";

export default function PeriodPicker({ value }: { value: string }) {
  return (
    <form method="GET">
      <input
        type="month"
        name="period"
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </form>
  );
}
