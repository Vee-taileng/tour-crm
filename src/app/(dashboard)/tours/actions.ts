"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { TourCategory, TourType, CommissionType, TourStatus } from "@/types/database";

type CSVTourRow = {
  name: string;
  tourType: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  commissionType: string;
  adultCommissionValue: number;
  childCommissionValue: number;
  status: string;
};

const tourSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tourType: z.string().min(1, "Tour type is required"),
  providerId: z.string().min(1, "Provider is required"),
  duration: z.string().min(1, "Duration is required"),
  includeLunch: z.boolean().default(false),
  adultPrice: z.coerce.number().min(0),
  childPrice: z.coerce.number().min(0),
  infantPrice: z.coerce.number().min(0),
  commissionType: z.string().min(1),
  adultCommissionValue: z.coerce.number().min(0),
  childCommissionValue: z.coerce.number().min(0),
  status: z.string().default("DRAFT"),
});

export async function createTour(formData: FormData) {
  const supabase = await createClient();
  const categories = formData.getAll("category") as TourCategory[];
  const departureTimes = formData.getAll("departureTimes") as string[];
  const inclusions = formData.getAll("inclusions") as string[];
  const exclusions = formData.getAll("exclusions") as string[];

  const data = tourSchema.parse({
    name: formData.get("name"),
    tourType: formData.get("tourType"),
    providerId: formData.get("providerId"),
    duration: formData.get("duration"),
    includeLunch: formData.get("includeLunch") === "true",
    adultPrice: formData.get("adultPrice"),
    childPrice: formData.get("childPrice"),
    infantPrice: formData.get("infantPrice"),
    commissionType: formData.get("commissionType"),
    adultCommissionValue: formData.get("adultCommissionValue"),
    childCommissionValue: formData.get("childCommissionValue"),
    status: formData.get("status"),
  });

  const minPaxRaw = formData.get("minPax");
  const maxPaxRaw = formData.get("maxPax");

  const { data: tour, error } = await supabase
    .from("tours")
    .insert({
      name: data.name,
      category: categories,
      tourType: data.tourType as TourType,
      providerId: data.providerId,
      duration: data.duration,
      departureTimes,
      includeLunch: data.includeLunch,
      inclusions,
      exclusions,
      adultPrice: data.adultPrice,
      childPrice: data.childPrice,
      infantPrice: data.infantPrice,
      commissionType: data.commissionType as CommissionType,
      adultCommissionValue: data.adultCommissionValue,
      childCommissionValue: data.childCommissionValue,
      minPax: minPaxRaw ? Number(minPaxRaw) : null,
      maxPax: maxPaxRaw ? Number(maxPaxRaw) : null,
      featuredImage: (formData.get("featuredImage") as string) || null,
      status: data.status as TourStatus,
    })
    .select()
    .single();

  if (error || !tour) throw new Error(error?.message ?? "Failed to create tour");
  revalidatePath("/tours");
  redirect(`/tours/${tour.id}`);
}

export async function updateTour(id: string, formData: FormData) {
  const supabase = await createClient();
  const categories = formData.getAll("category") as TourCategory[];
  const departureTimes = formData.getAll("departureTimes") as string[];
  const inclusions = formData.getAll("inclusions") as string[];
  const exclusions = formData.getAll("exclusions") as string[];

  const data = tourSchema.parse({
    name: formData.get("name"),
    tourType: formData.get("tourType"),
    providerId: formData.get("providerId"),
    duration: formData.get("duration"),
    includeLunch: formData.get("includeLunch") === "true",
    adultPrice: formData.get("adultPrice"),
    childPrice: formData.get("childPrice"),
    infantPrice: formData.get("infantPrice"),
    commissionType: formData.get("commissionType"),
    adultCommissionValue: formData.get("adultCommissionValue"),
    childCommissionValue: formData.get("childCommissionValue"),
    status: formData.get("status"),
  });

  const minPaxRaw = formData.get("minPax");
  const maxPaxRaw = formData.get("maxPax");

  const { error } = await supabase
    .from("tours")
    .update({
      name: data.name,
      category: categories,
      tourType: data.tourType as TourType,
      providerId: data.providerId,
      duration: data.duration,
      departureTimes,
      includeLunch: data.includeLunch,
      inclusions,
      exclusions,
      adultPrice: data.adultPrice,
      childPrice: data.childPrice,
      infantPrice: data.infantPrice,
      commissionType: data.commissionType as CommissionType,
      adultCommissionValue: data.adultCommissionValue,
      childCommissionValue: data.childCommissionValue,
      minPax: minPaxRaw ? Number(minPaxRaw) : null,
      maxPax: maxPaxRaw ? Number(maxPaxRaw) : null,
      featuredImage: (formData.get("featuredImage") as string) || null,
      status: data.status as TourStatus,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/tours");
  redirect("/tours");
}

export async function deleteTour(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tours");
  redirect("/tours");
}

export async function bulkCreateTours(providerId: string, rows: CSVTourRow[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("tours").insert(
    rows.map((r) => ({
      name: r.name,
      tourType: r.tourType as TourType,
      providerId,
      duration: r.duration,
      category: [] as TourCategory[],
      departureTimes: [] as string[],
      inclusions: [] as string[],
      exclusions: [] as string[],
      includeLunch: false,
      adultPrice: r.adultPrice,
      childPrice: r.childPrice,
      infantPrice: r.infantPrice,
      commissionType: (r.commissionType || "FIXED") as CommissionType,
      adultCommissionValue: r.adultCommissionValue,
      childCommissionValue: r.childCommissionValue,
      status: (r.status || "DRAFT") as TourStatus,
    }))
  );
  if (error) throw new Error(error.message);
  revalidatePath("/tours");
}
