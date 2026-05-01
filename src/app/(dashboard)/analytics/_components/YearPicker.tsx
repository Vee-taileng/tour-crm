"use client";

export default function YearPicker({ value }: { value: string }) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <form method="GET">
      <select
        name="year"
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      >
        <option value="all">All time</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </form>
  );
}
