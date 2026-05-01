import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import TourForm from "../_components/TourForm";

export default async function NewTourPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("tour_providers")
    .select("*")
    .eq("isActive", true)
    .order("name");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <Link href="/tours" className="hover:text-gray-700">
          Tour Catalogue
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">New Tour</span>
      </div>
      <PageHeader title="New Tour" className="mb-6" />
      <TourForm providers={providers ?? []} />
    </div>
  );
}
