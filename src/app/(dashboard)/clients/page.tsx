import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .order("createdAt", { ascending: false });
  if (q) query = query.or(`fullName.ilike.%${q}%,whatsapp.ilike.%${q}%`);

  const { data: clients } = await query;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Clients"
        description="Customer database"
        className="mb-6"
        action={
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Client
          </Link>
        }
      />

      <form method="GET" className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or WhatsApp…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {clients && clients.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">WhatsApp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nationality</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Since</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{client.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{client.whatsapp}</td>
                  <td className="px-4 py-3 text-gray-600">{client.nationality ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(client.createdAt)}</td>
                  <td className="px-4 py-3">
                    {client.isRepeat ? (
                      <Badge variant="orange">Repeat</Badge>
                    ) : (
                      <Badge variant="gray">New</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-orange-600 hover:text-orange-700 font-medium text-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-gray-400">
            {q ? `No clients matching "${q}"` : "No clients yet."}
          </div>
        )}
      </div>
    </div>
  );
}
