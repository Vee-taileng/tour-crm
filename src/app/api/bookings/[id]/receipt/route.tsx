import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { BookingReceipt } from "@/components/BookingReceipt";
import type { BookingWithRelations, Bank } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, clients(*), tours(*, tour_providers(*)), pickup_locations(*)")
    .eq("id", id)
    .single();

  if (!data) return new Response("Not found", { status: 404 });

  const booking = data as unknown as BookingWithRelations;

  const { data: bankData } = await supabase
    .from("banks")
    .select("*")
    .eq("providerId", booking.tours.providerId)
    .eq("isPrimary", true)
    .maybeSingle();

  const bank = bankData as Bank | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(React.createElement(BookingReceipt, { booking, bank }) as any);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${booking.bookingRef}.pdf"`,
    },
  });
}
