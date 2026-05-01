import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import TourForm from "../_components/TourForm";
import DeleteTourButton from "../_components/DeleteTourButton";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tour }, { data: providers }] = await Promise.all([
    supabase.from("tours").select("*").eq("id", id).single(),
    supabase.from("tour_providers").select("*").eq("isActive", true).order("name"),
  ]);

  if (!tour) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <Link href="/tours" className="hover:text-gray-700">
          Tour Catalogue
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">{tour.name}</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title={tour.name} description={`ID: ${tour.id}`} />
        <DeleteTourButton id={id} />
      </div>
      <TourForm tour={tour} providers={providers ?? []} />
    </div>
  );
}
