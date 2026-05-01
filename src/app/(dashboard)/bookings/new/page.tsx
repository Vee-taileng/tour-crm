import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import NewBookingForm from "../_components/NewBookingForm";

export default async function NewBookingPage() {
  const supabase = await createClient();

  const [{ data: tours }, { data: locations }] = await Promise.all([
    supabase.from("tours").select("*").eq("status", "ACTIVE").order("name"),
    supabase.from("pickup_locations").select("*").eq("isActive", true).order("name"),
  ]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <Link href="/bookings" className="hover:text-gray-700">
          Bookings
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">New Booking</span>
      </div>
      <PageHeader title="New Booking" className="mb-6" />
      <NewBookingForm tours={tours ?? []} locations={locations ?? []} />
    </div>
  );
}
