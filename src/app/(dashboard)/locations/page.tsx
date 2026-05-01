import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import LocationsManager from "./_components/LocationsManager";

export default async function LocationsPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("pickup_locations")
    .select("*")
    .order("name");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Pickup Locations"
        description="Manage standard pickup points used in bookings"
        className="mb-6"
      />
      <LocationsManager locations={locations ?? []} />
    </div>
  );
}
