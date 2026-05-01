import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils";
import type { BookingSource } from "@/types/database";
import { TrendingUp, Globe, Share2 } from "lucide-react";
import YearPicker from "./_components/YearPicker";

type AnalyticsRow = {
  tourId: string;
  bookingSource: BookingSource | null;
  totalAmount: number;
  adultPax: number;
  childPax: number;
  infantPax: number;
  tours: { name: string; tour_providers: { name: string } | null } | null;
  clients: { nationality: string | null } | null;
};

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: "Walk-in",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Website",
  PARTNER: "Partner",
};

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const activeYear = year ?? String(new Date().getFullYear());

  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      "tourId, bookingSource, totalAmount, adultPax, childPax, infantPax, tours(name, tour_providers(name)), clients(nationality)"
    )
    .neq("bookingStatus", "CANCELLED");

  if (activeYear !== "all") {
    query = query
      .gte("tourDate", `${activeYear}-01-01`)
      .lte("tourDate", `${activeYear}-12-31`);
  }

  const { data } = await query;
  const rows = (data ?? []) as unknown as AnalyticsRow[];

  // --- Top tours by revenue ---
  type TourStat = { tourName: string; providerName: string; count: number; revenue: number; pax: number };
  const tourMap = new Map<string, TourStat>();
  for (const r of rows) {
    const existing = tourMap.get(r.tourId);
    if (existing) {
      existing.count += 1;
      existing.revenue += r.totalAmount;
      existing.pax += r.adultPax + r.childPax + r.infantPax;
    } else {
      tourMap.set(r.tourId, {
        tourName: r.tours?.name ?? "Unknown Tour",
        providerName: r.tours?.tour_providers?.name ?? "Unknown Provider",
        count: 1,
        revenue: r.totalAmount,
        pax: r.adultPax + r.childPax + r.infantPax,
      });
    }
  }
  const topTours = [...tourMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const maxTourRevenue = Math.max(...topTours.map((t) => t.revenue), 1);

  // --- Top nationalities ---
  const nationalityMap = new Map<string, number>();
  for (const r of rows) {
    const nat = r.clients?.nationality?.trim() || "Unknown";
    nationalityMap.set(nat, (nationalityMap.get(nat) ?? 0) + 1);
  }
  const topNationalities = [...nationalityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nationality, count]) => ({ nationality, count }));
  const maxNatCount = Math.max(...topNationalities.map((n) => n.count), 1);

  // --- Booking sources ---
  const sourceMap = new Map<string, number>();
  for (const r of rows) {
    const src = r.bookingSource ?? "UNKNOWN";
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
  }
  const sourceStats = [...sourceMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({ source, label: SOURCE_LABELS[source] ?? source, count }));
  const maxSourceCount = Math.max(...sourceStats.map((s) => s.count), 1);

  const totalBookings = rows.length;
  const periodLabel = activeYear === "all" ? "All Time" : activeYear;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <PageHeader title="Analytics" description={`Sales breakdown — ${periodLabel}`} />
        <div className="mt-1">
          <YearPicker value={activeYear} />
        </div>
      </div>

      {/* Top Tours by Revenue */}
      <Section icon={TrendingUp} color="orange" title="Top Tours by Revenue">
        {topTours.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {topTours.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-48 shrink-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.tourName}</p>
                  <p className="text-xs text-gray-400 truncate">{t.providerName}</p>
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-md transition-all"
                    style={{ width: `${(t.revenue / maxTourRevenue) * 100}%` }}
                  />
                </div>
                <span className="w-24 text-right text-sm font-medium text-gray-900 shrink-0">
                  {formatCurrency(t.revenue)}
                </span>
                <span className="hidden sm:inline w-20 text-right text-xs text-gray-400 shrink-0">
                  {t.count} {t.count === 1 ? "booking" : "bookings"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Nationalities */}
        <Section icon={Globe} color="blue" title="Top Nationalities">
          {topNationalities.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {topNationalities.map((n) => (
                <div key={n.nationality} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-700 truncate shrink-0">{n.nationality}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-md transition-all"
                      style={{ width: `${(n.count / maxNatCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-gray-900 shrink-0">
                    {n.count}
                  </span>
                  <span className="w-10 text-right text-xs text-gray-400 shrink-0">
                    {totalBookings > 0 ? `${Math.round((n.count / totalBookings) * 100)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Booking Sources */}
        <Section icon={Share2} color="green" title="Booking Sources">
          {sourceStats.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {sourceStats.map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="w-28 text-sm text-gray-700 shrink-0">{s.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-md transition-all"
                      style={{ width: `${(s.count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-gray-900 shrink-0">
                    {s.count}
                  </span>
                  <span className="w-10 text-right text-xs text-gray-400 shrink-0">
                    {totalBookings > 0 ? `${Math.round((s.count / totalBookings) * 100)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  color,
  title,
  children,
}: {
  icon: React.ElementType;
  color: "orange" | "blue" | "green";
  title: string;
  children: React.ReactNode;
}) {
  const colorMap = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-medium text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="py-4 text-center text-sm text-gray-400">No data for this period.</p>;
}
