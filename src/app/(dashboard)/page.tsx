import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { BookOpen, Users, Building2, ArrowLeftRight, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getStats() {
  const supabase = await createClient();

  // Six months back (first day of month)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const fromDate = sixMonthsAgo.toISOString().split("T")[0];

  const [bookingsRes, clientsRes, providersRes, pendingTransfersRes, allCommissionRes] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, totalAmount, bookingStatus", { count: "exact" })
        .neq("bookingStatus", "CANCELLED"),
      supabase.from("clients").select("id", { count: "exact" }),
      supabase.from("tour_providers").select("id", { count: "exact" }).eq("isActive", true),
      supabase
        .from("bookings")
        .select("netAmount")
        .eq("paymentStatus", "PAID")
        .eq("bookingStatus", "CONFIRMED"),
      supabase
        .from("bookings")
        .select("tourDate, commissionAmount")
        .neq("bookingStatus", "CANCELLED")
        .gte("tourDate", fromDate),
    ]);

  const totalRevenue = (bookingsRes.data ?? []).reduce((s, b) => s + (b.totalAmount ?? 0), 0);

  const transfersRes = await supabase.from("provider_transfers").select("amount");
  const totalTransferred = (transfersRes.data ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalNetOwed = (pendingTransfersRes.data ?? []).reduce((s, b) => s + (b.netAmount ?? 0), 0);

  // Group commission by year-month
  type MonthEntry = { label: string; commission: number; count: number };
  const monthMap = new Map<string, MonthEntry>();

  // Pre-populate the last 6 months in order so empty months still appear
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    monthMap.set(key, { label, commission: 0, count: 0 });
  }

  for (const row of allCommissionRes.data ?? []) {
    const key = row.tourDate.slice(0, 7); // "YYYY-MM"
    const entry = monthMap.get(key);
    if (entry) {
      entry.commission += row.commissionAmount ?? 0;
      entry.count += 1;
    }
  }

  const monthlyCommission = [...monthMap.values()];
  const maxCommission = Math.max(...monthlyCommission.map((m) => m.commission), 1);

  return {
    totalBookings: bookingsRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    activeProviders: providersRes.count ?? 0,
    totalRevenue,
    outstandingBalance: Math.max(0, totalNetOwed - totalTransferred),
    monthlyCommission,
    maxCommission,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Bookings", value: stats.totalBookings.toString(), icon: BookOpen, color: "blue" },
    { label: "Total Clients", value: stats.totalClients.toString(), icon: Users, color: "green" },
    { label: "Active Providers", value: stats.activeProviders.toString(), icon: Building2, color: "orange" },
    { label: "Outstanding Balance", value: formatCurrency(stats.outstandingBalance), icon: ArrowLeftRight, color: "red" },
  ];

  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader title="Dashboard" description="Overview of your tour operations" className="mb-6" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Monthly commission */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <h2 className="text-sm font-medium text-gray-700">Commission Earned — Last 6 Months</h2>
        </div>

        <div className="space-y-3">
          {stats.monthlyCommission.map((m) => (
            <div key={m.label} className="flex items-center gap-2 sm:gap-3">
              <span className="w-14 sm:w-20 text-xs text-gray-500 shrink-0">{m.label}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-md transition-all"
                  style={{ width: `${(m.commission / stats.maxCommission) * 100}%` }}
                />
              </div>
              <span className="w-20 sm:w-24 text-right text-sm font-medium text-gray-900 shrink-0">
                {formatCurrency(m.commission)}
              </span>
              <span className="hidden sm:inline w-14 text-right text-xs text-gray-400 shrink-0">
                {m.count} {m.count === 1 ? "booking" : "bookings"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: "/bookings/new", label: "New Booking" },
            { href: "/tours/new", label: "Add Tour" },
            { href: "/providers/new", label: "Add Provider" },
            { href: "/clients", label: "Client Search" },
            { href: "/transfers/new", label: "Log Transfer" },
            { href: "/manifest", label: "Daily Manifest" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-center"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
