"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const transferSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  bankId: z.string().min(1, "Bank account is required"),
  transferDate: z.string().min(1, "Date is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

export async function createTransfer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = transferSchema.parse({
    providerId: formData.get("providerId"),
    bankId: formData.get("bankId"),
    transferDate: formData.get("transferDate"),
    amount: formData.get("amount"),
    referenceNo: formData.get("referenceNo"),
    notes: formData.get("notes"),
  });

  const bookingIdsRaw = formData.get("bookingIds") as string;
  const bookingIds = bookingIdsRaw
    ? bookingIdsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const { data: transfer, error } = await supabase
    .from("provider_transfers")
    .insert({
      providerId: data.providerId,
      bankId: data.bankId,
      transferDate: data.transferDate,
      amount: data.amount,
      referenceNo: data.referenceNo || null,
      notes: data.notes || null,
      bookingIds,
      loggedBy: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/transfers");
  redirect(`/transfers`);
}
