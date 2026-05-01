"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const clientSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  whatsapp: z.string().min(1, "WhatsApp is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  nationality: z.string().optional(),
});

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  const data = clientSchema.parse({
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    nationality: formData.get("nationality"),
  });

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      fullName: data.fullName,
      whatsapp: data.whatsapp,
      email: data.email || null,
      nationality: data.nationality || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const data = clientSchema.parse({
    fullName: formData.get("fullName"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    nationality: formData.get("nationality"),
  });

  const { error } = await supabase
    .from("clients")
    .update({
      fullName: data.fullName,
      whatsapp: data.whatsapp,
      email: data.email || null,
      nationality: data.nationality || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}
