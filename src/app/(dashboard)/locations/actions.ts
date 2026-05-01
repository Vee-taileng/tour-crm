"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  zone: z.string().optional(),
});

export async function addLocation(formData: FormData) {
  const supabase = await createClient();
  const data = locationSchema.parse({
    name: formData.get("name"),
    zone: formData.get("zone"),
  });
  const { error } = await supabase.from("pickup_locations").insert({
    name: data.name,
    zone: data.zone || null,
    isActive: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/locations");
}

export async function updateLocation(id: string, formData: FormData) {
  const supabase = await createClient();
  const data = locationSchema.parse({
    name: formData.get("name"),
    zone: formData.get("zone"),
  });
  const { error } = await supabase
    .from("pickup_locations")
    .update({ name: data.name, zone: data.zone || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/locations");
}

export async function toggleLocation(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("pickup_locations")
    .update({ isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/locations");
}
