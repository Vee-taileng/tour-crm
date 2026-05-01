import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { Plus, Phone, Mail } from "lucide-react";

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("tour_providers")
    .select("*, banks(id)")
    .order("name");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Tour Providers"
        description="Manage provider profiles and bank accounts"
        className="mb-6"
        action={
          <Link
            href="/providers/new"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </Link>
        }
      />

      {!providers || providers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-sm">No providers yet.</p>
          <Link
            href="/providers/new"
            className="inline-flex items-center gap-2 mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add your first provider
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {providers.map((p) => (
            <Link
              key={p.id}
              href={`/providers/${p.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    {p.contactName && (
                      <span className="text-xs text-gray-500">{p.contactName}</span>
                    )}
                    {p.phone && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {p.phone}
                      </span>
                    )}
                    {p.email && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" />
                        {p.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {Array.isArray(p.banks) ? p.banks.length : 0} bank{(!Array.isArray(p.banks) || p.banks.length !== 1) ? "s" : ""}
                </span>
                <Badge variant={p.isActive ? "green" : "gray"}>
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
