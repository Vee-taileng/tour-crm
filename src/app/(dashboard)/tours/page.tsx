import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { TourType, TourWithProvider } from "@/types/database";
import TourCSVImport from "./_components/TourCSVImport";

const TOUR_TYPE_LABELS: Record<string, string> = {
  ELEPHANTS: "Elephants",
  BAMBOO_RAFTING: "Bamboo Rafting",
  COOKING_CLASS: "Cooking Class",
  MUAY_THAI: "Muay Thai",
  TEMPLE_TOUR: "Temple Tour",
  WATERFALLS: "Waterfalls",
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; providerId?: string; tourType?: string }>;
}) {
  const { q, providerId, tourType } = await searchParams;
  const supabase = await createClient();

  let toursQuery = supabase
    .from("tours")
    .select("*, tour_providers(*)")
    .order("createdAt", { ascending: false });

  if (q) toursQuery = toursQuery.ilike("name", `%${q}%`);
  if (tourType) toursQuery = toursQuery.eq("tourType", tourType as TourType);
  if (providerId) toursQuery = toursQuery.eq("providerId", providerId);

  const [{ data }, { data: providers }] = await Promise.all([
    toursQuery,
    supabase.from("tour_providers").select("*").eq("isActive", true).order("name"),
  ]);

  const tours = (data ?? []) as unknown as TourWithProvider[];
  const hasFilters = q || providerId || tourType;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Tour Catalogue"
        description="Manage tours, pricing, and commission settings"
        className="mb-6"
        action={
          <div className="flex items-center gap-2">
            <TourCSVImport providers={providers ?? []} />
            <Link
              href="/tours/new"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tour
            </Link>
          </div>
        }
      />

      <form method="GET" className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search tours…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          name="tourType"
          defaultValue={tourType ?? ""}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 bg-white"
        >
          <option value="">All types</option>
          {Object.entries(TOUR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="providerId"
          defaultValue={providerId ?? ""}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 bg-white"
        >
          <option value="">All providers</option>
          {(providers ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
        {hasFilters && (
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {tours.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-14" />
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tour</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Provider</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Adult Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {tour.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={tour.featuredImage}
                        alt={tour.name}
                        className="w-10 h-10 rounded-md object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-gray-100" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{tour.name}</div>
                    <div className="text-gray-400 text-xs">{tour.duration}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {TOUR_TYPE_LABELS[tour.tourType] ?? tour.tourType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {tour.tour_providers?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {formatCurrency(tour.adultPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <TourStatusBadge status={tour.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/tours/${tour.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">
            {hasFilters ? (
              <>
                No tours match your search.{" "}
                <Link href="/tours" className="text-orange-600 hover:underline">
                  Clear filters.
                </Link>
              </>
            ) : (
              <>
                No tours yet.{" "}
                <Link href="/tours/new" className="text-orange-600 hover:underline">
                  Add the first one.
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TourStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") return <Badge variant="green">Active</Badge>;
  if (status === "INACTIVE") return <Badge variant="red">Inactive</Badge>;
  return <Badge variant="gray">Draft</Badge>;
}
