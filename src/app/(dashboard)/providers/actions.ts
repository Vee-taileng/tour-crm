"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const providerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNo: z.string().min(1, "Account number is required"),
  isPrimary: z.boolean().default(false),
});

export async function createProvider(formData: FormData) {
  const supabase = await createClient();
  const raw = {
    name: formData.get("name") as string,
    contactName: formData.get("contactName") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    notes: formData.get("notes") as string,
    isActive: true,
  };
  const data = providerSchema.parse(raw);
  const { data: provider, error } = await supabase
    .from("tour_providers")
    .insert({
      name: data.name,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      isActive: data.isActive,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/providers");
  redirect(`/providers/${provider.id}`);
}

export async function updateProvider(id: string, formData: FormData) {
  const supabase = await createClient();
  const raw = {
    name: formData.get("name") as string,
    contactName: formData.get("contactName") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    notes: formData.get("notes") as string,
    isActive: formData.get("isActive") === "true",
  };
  const data = providerSchema.parse(raw);
  const { error } = await supabase
    .from("tour_providers")
    .update({
      name: data.name,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      isActive: data.isActive,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/providers");
  revalidatePath(`/providers/${id}`);
  redirect(`/providers/${id}`);
}

export async function addBankAccount(providerId: string, formData: FormData) {
  const supabase = await createClient();
  const raw = {
    bankName: formData.get("bankName") as string,
    accountName: formData.get("accountName") as string,
    accountNo: formData.get("accountNo") as string,
    isPrimary: formData.get("isPrimary") === "true",
  };
  const data = bankSchema.parse(raw);

  if (data.isPrimary) {
    await supabase
      .from("banks")
      .update({ isPrimary: false })
      .eq("providerId", providerId);
  }

  const { error } = await supabase.from("banks").insert({
    providerId,
    bankName: data.bankName,
    accountName: data.accountName,
    accountNo: data.accountNo,
    isPrimary: data.isPrimary,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/providers/${providerId}`);
}

export async function deleteBankAccount(bankId: string, providerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("banks").delete().eq("id", bankId);
  if (error) throw new Error(error.message);
  revalidatePath(`/providers/${providerId}`);
}

export async function setPrimaryBank(bankId: string, providerId: string) {
  const supabase = await createClient();
  await supabase
    .from("banks")
    .update({ isPrimary: false })
    .eq("providerId", providerId);
  await supabase.from("banks").update({ isPrimary: true }).eq("id", bankId);
  revalidatePath(`/providers/${providerId}`);
}
