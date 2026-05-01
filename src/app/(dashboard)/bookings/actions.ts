"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateCommission } from "@/lib/utils";
import type { PaymentStatus, BookingStatus, BookingSource } from "@/types/database";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Auto-create client from typed name + phone
  const clientName = (formData.get("clientName") as string).trim();
  const clientPhone = (formData.get("clientPhone") as string).trim();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({ fullName: clientName, whatsapp: clientPhone })
    .select()
    .single();
  if (clientError || !client) throw new Error(clientError?.message ?? "Failed to create client");

  const tourId = formData.get("tourId") as string;
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .single();
  if (tourError || !tour) throw new Error("Tour not found");

  const adultPax = Number(formData.get("adultPax") ?? 0);
  const childPax = Number(formData.get("childPax") ?? 0);
  const infantPax = Number(formData.get("infantPax") ?? 0);

  const adultAmount = adultPax * tour.adultPrice;
  const childAmount = childPax * tour.childPrice;
  const totalAmount = adultAmount + childAmount + infantPax * tour.infantPrice;
  const commissionAmount = calculateCommission(
    tour.commissionType,
    tour.adultCommissionValue,
    tour.childCommissionValue,
    adultPax,
    adultAmount,
    childPax,
    childAmount,
  );
  const netAmount = totalAmount - commissionAmount;

  const pickupRaw = formData.get("pickupLocationId") as string;
  const amountReceivedRaw = formData.get("amountReceived") as string;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      clientId: client.id,
      tourId,
      tourDate: formData.get("tourDate") as string,
      departureTime: (formData.get("departureTime") as string) || null,
      adultPax,
      childPax,
      infantPax,
      pickupLocationId: pickupRaw || null,
      hotelName: (formData.get("hotelName") as string) || null,
      hotelRoom: (formData.get("hotelRoom") as string) || null,
      notes: (formData.get("notes") as string) || null,
      adultUnitPrice: tour.adultPrice,
      childUnitPrice: tour.childPrice,
      infantUnitPrice: tour.infantPrice,
      totalAmount,
      commissionAmount,
      netAmount,
      paymentStatus: ((formData.get("paymentStatus") as PaymentStatus) ?? "UNPAID"),
      amountReceived: amountReceivedRaw ? Number(amountReceivedRaw) : null,
      bookingSource: ((formData.get("bookingSource") as BookingSource) || null),
      bookingStatus: ((formData.get("bookingStatus") as BookingStatus) ?? "PENDING"),
      createdBy: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/bookings");
  redirect(`/bookings/${booking.id}`);
}

export async function updateBooking(id: string, formData: FormData) {
  const supabase = await createClient();

  const tourId = formData.get("tourId") as string;
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("id", tourId)
    .single();
  if (tourError || !tour) throw new Error("Tour not found");

  const adultPax = Number(formData.get("adultPax") ?? 0);
  const childPax = Number(formData.get("childPax") ?? 0);
  const infantPax = Number(formData.get("infantPax") ?? 0);

  const adultAmount = adultPax * tour.adultPrice;
  const childAmount = childPax * tour.childPrice;
  const totalAmount = adultAmount + childAmount + infantPax * tour.infantPrice;
  const commissionAmount = calculateCommission(
    tour.commissionType,
    tour.adultCommissionValue,
    tour.childCommissionValue,
    adultPax,
    adultAmount,
    childPax,
    childAmount,
  );
  const netAmount = totalAmount - commissionAmount;

  const pickupRaw = formData.get("pickupLocationId") as string;
  const amountReceivedRaw = formData.get("amountReceived") as string;

  // price fields are not in the generated Update type but are valid columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("bookings") as any)
    .update({
      tourDate: formData.get("tourDate") as string,
      departureTime: (formData.get("departureTime") as string) || null,
      adultPax,
      childPax,
      infantPax,
      pickupLocationId: pickupRaw || null,
      hotelName: (formData.get("hotelName") as string) || null,
      hotelRoom: (formData.get("hotelRoom") as string) || null,
      notes: (formData.get("notes") as string) || null,
      paymentStatus: (formData.get("paymentStatus") as PaymentStatus) ?? "UNPAID",
      amountReceived: amountReceivedRaw ? Number(amountReceivedRaw) : null,
      bookingSource: (formData.get("bookingSource") as BookingSource) || null,
      bookingStatus: (formData.get("bookingStatus") as BookingStatus) ?? "PENDING",
      adultUnitPrice: tour.adultPrice,
      childUnitPrice: tour.childPrice,
      infantUnitPrice: tour.infantPrice,
      totalAmount,
      commissionAmount,
      netAmount,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${id}`);
  redirect(`/bookings/${id}`);
}
