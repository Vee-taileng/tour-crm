import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { BookingWithRelations, Bank } from "@/types/database";
import { formatDate } from "@/lib/utils";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  orange: "#ea580c",
  orangeLight: "#fff7ed",
  orangeMid: "#fed7aa",
  dark: "#111827",
  gray9: "#1f2937",
  gray7: "#374151",
  gray5: "#6b7280",
  gray3: "#d1d5db",
  gray2: "#e5e7eb",
  gray1: "#f9fafb",
  white: "#ffffff",
  green: "#16a34a",
  greenBg: "#dcfce7",
  red: "#dc2626",
  redBg: "#fee2e2",
  amber: "#d97706",
  amberBg: "#fef3c7",
  internalBg: "#1e293b",
  internalAccent: "#f97316",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: { fontSize: 9.5, fontFamily: "Helvetica", color: C.dark, lineHeight: 1.45 },

  // Header band
  headerBand: { paddingHorizontal: 44, paddingVertical: 28 },
  headerBandOrange: { backgroundColor: C.orange },
  headerBandDark: { backgroundColor: C.internalBg },
  headerEyebrow: { fontSize: 8, letterSpacing: 1.2, color: "rgba(255,255,255,0.7)", marginBottom: 6 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 9, color: "rgba(255,255,255,0.65)" },
  headerBadgeRow: { flexDirection: "row", gap: 6, marginTop: 14 },

  // Body
  body: { paddingHorizontal: 44, paddingVertical: 24 },

  // Ref row
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.gray2,
    marginBottom: 20,
  },
  refLabel: { fontSize: 8, color: C.gray5, marginBottom: 2 },
  refValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: C.dark },

  // Two-column row
  colRow: { flexDirection: "row", gap: 20, marginBottom: 22 },
  col: { flex: 1 },

  // Section
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.gray5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.gray2,
    marginBottom: 10,
  },

  // Key-value rows (full width)
  kvRow: { flexDirection: "row", marginBottom: 4 },
  kvLabel: { width: 110, color: C.gray5 },
  kvValue: { flex: 1, color: C.dark },

  // Key-value rows (inside a half-width column)
  kvRowCol: { flexDirection: "row", marginBottom: 4 },
  kvLabelCol: { width: 72, color: C.gray5 },
  kvValueCol: { flex: 1, color: C.dark },

  // Chip / badge
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 100,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  // Pax cards
  paxRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  paxCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.gray2,
    borderRadius: 6,
    padding: 10,
    backgroundColor: C.gray1,
  },
  paxCardLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.gray5, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  paxCardCount: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 2 },
  paxCardRate: { fontSize: 8, color: C.gray5 },

  // Line items
  lineRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.gray2 },
  lineDesc: { flex: 1, color: C.gray7 },
  lineAmt: { color: C.dark, fontFamily: "Helvetica-Bold" },

  // Total
  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.orangeLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  totalLabel: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 11 },
  totalAmt: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.orange },

  // Balance
  balanceRow: { flexDirection: "row", paddingVertical: 4, marginTop: 4 },
  balanceLabel: { flex: 1, color: C.gray5 },
  balanceAmt: { color: C.gray5 },
  balanceDueAmt: { color: C.red, fontFamily: "Helvetica-Bold" },

  // Policy
  policyText: { color: C.gray7, lineHeight: 1.6 },

  // Signature box
  sigBox: {
    borderWidth: 1,
    borderColor: C.gray3,
    borderRadius: 6,
    height: 56,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  sigLabel: { fontSize: 8, color: C.gray5 },

  // Revenue breakdown (internal)
  revenueRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.gray2 },
  revenueLabel: { flex: 1, color: C.gray7 },
  revenueAmt: { color: C.dark },
  netBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: C.orangeLight,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
  },
  netLabel: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 11 },
  netAmt: { fontFamily: "Helvetica-Bold", fontSize: 14, color: C.orange },

  // Bank details
  bankCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: C.gray2,
    borderRadius: 6,
    padding: 12,
    backgroundColor: C.gray1,
    gap: 12,
    alignItems: "flex-start",
  },
  bankIcon: { width: 28, height: 28, borderRadius: 6, backgroundColor: C.orangeLight, alignItems: "center", justifyContent: "center" },
  bankIconText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.orange },
  bankName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 2 },
  bankMeta: { fontSize: 8.5, color: C.gray5 },

  // Audit
  auditRow: { flexDirection: "row", paddingVertical: 3 },
  auditLabel: { width: 100, color: C.gray5 },
  auditValue: { flex: 1, color: C.gray7 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 28,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.gray2,
  },
  footerText: { fontSize: 7.5, color: C.gray5 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
// ฿ is outside the Helvetica character set — use "THB" prefix for PDF rendering
function thb(n: number) {
  return `THB ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function Chip({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <Text style={[S.chip, { backgroundColor: bg, color }]}>{label}</Text>
  );
}

const BOOKING_CHIPS: Record<string, { bg: string; color: string }> = {
  CONFIRMED: { bg: C.greenBg, color: C.green },
  PENDING:   { bg: C.amberBg, color: C.amber },
  CANCELLED: { bg: C.redBg,   color: C.red },
  NO_SHOW:   { bg: "#f3f4f6", color: C.gray5 },
};
const PAYMENT_CHIPS: Record<string, { bg: string; color: string }> = {
  PAID:    { bg: "#dbeafe", color: "#1d4ed8" },
  DEPOSIT: { bg: C.amberBg, color: C.amber },
  UNPAID:  { bg: C.redBg,   color: C.red },
};

// ── Client Receipt Page ───────────────────────────────────────────────────────
function ClientPage({ booking }: { booking: BookingWithRelations }) {
  const bChip = BOOKING_CHIPS[booking.bookingStatus] ?? { bg: "#f3f4f6", color: C.gray5 };
  const pChip = PAYMENT_CHIPS[booking.paymentStatus] ?? { bg: "#f3f4f6", color: C.gray5 };
  const adultLine = booking.adultPax > 0 ? booking.adultPax * booking.adultUnitPrice : 0;
  const childLine = booking.childPax > 0 ? booking.childPax * booking.childUnitPrice : 0;
  const balance = booking.amountReceived != null ? booking.totalAmount - booking.amountReceived : null;

  return (
    <Page size="A4" style={S.page}>
      {/* Header */}
      <View style={[S.headerBand, S.headerBandOrange, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
        <View>
          <Text style={S.headerEyebrow}>CHIANG MAI CLICKS</Text>
          <Text style={S.headerTitle}>Booking Confirmation</Text>
          <Text style={S.headerSubtitle}>Tour receipt &amp; acknowledgement</Text>
          <View style={S.headerBadgeRow}>
            <Chip label={booking.bookingStatus} bg={bChip.bg} color={bChip.color} />
            <Chip label={booking.paymentStatus} bg={pChip.bg} color={pChip.color} />
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: 0.5 }}>BOOKING REF</Text>
          <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 10 }}>{booking.bookingRef}</Text>
          <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>{formatDate(booking.bookingDate)}</Text>
        </View>
      </View>

      <View style={S.body}>
        {/* Tour details + Guest — side by side */}
        <View style={S.colRow}>
          {/* Left: Tour details */}
          <View style={S.col}>
            <Text style={S.sectionTitle}>Tour Details</Text>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Tour</Text><Text style={S.kvValueCol}>{booking.tours.name}</Text></View>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Date</Text><Text style={S.kvValueCol}>{formatDate(booking.tourDate)}</Text></View>
            {booking.departureTime && (
              <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Departure</Text><Text style={S.kvValueCol}>{booking.departureTime}</Text></View>
            )}
            <View style={S.kvRowCol}>
              <Text style={S.kvLabelCol}>Lunch</Text>
              <Text style={S.kvValueCol}>{booking.tours.includeLunch ? "Included" : "Not included"}</Text>
            </View>
          </View>

          {/* Right: Guest */}
          <View style={S.col}>
            <Text style={S.sectionTitle}>Guest</Text>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Name</Text><Text style={[S.kvValueCol, { fontFamily: "Helvetica-Bold" }]}>{booking.clients.fullName}</Text></View>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>WhatsApp</Text><Text style={S.kvValueCol}>{booking.clients.whatsapp}</Text></View>
            {booking.pickup_locations && (
              <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Pickup</Text><Text style={S.kvValueCol}>{booking.pickup_locations.name}</Text></View>
            )}
            {booking.hotelName && (
              <View style={S.kvRowCol}>
                <Text style={S.kvLabelCol}>Hotel / Room</Text>
                <Text style={S.kvValueCol}>{booking.hotelName}{booking.hotelRoom ? ` / ${booking.hotelRoom}` : ""}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Passengers */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Passengers</Text>
          <View style={S.paxRow}>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Adult</Text>
              <Text style={S.paxCardCount}>{booking.adultPax}</Text>
              <Text style={S.paxCardRate}>{thb(booking.adultUnitPrice)} / ea</Text>
            </View>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Child</Text>
              <Text style={S.paxCardCount}>{booking.childPax}</Text>
              <Text style={S.paxCardRate}>{booking.childUnitPrice > 0 ? `${thb(booking.childUnitPrice)} / ea` : "Free"}</Text>
            </View>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Infant</Text>
              <Text style={S.paxCardCount}>{booking.infantPax}</Text>
              <Text style={S.paxCardRate}>Free</Text>
            </View>
          </View>

          {adultLine > 0 && (
            <View style={S.lineRow}>
              <Text style={S.lineDesc}>{booking.adultPax} x Adult</Text>
              <Text style={S.lineAmt}>{thb(adultLine)}</Text>
            </View>
          )}
          {childLine > 0 && (
            <View style={S.lineRow}>
              <Text style={S.lineDesc}>{booking.childPax} x Child</Text>
              <Text style={S.lineAmt}>{thb(childLine)}</Text>
            </View>
          )}
          {booking.infantPax > 0 && (
            <View style={S.lineRow}>
              <Text style={S.lineDesc}>{booking.infantPax} x Infant</Text>
              <Text style={S.lineAmt}>Free</Text>
            </View>
          )}

          <View style={S.totalBox}>
            <Text style={S.totalLabel}>Total</Text>
            <Text style={S.totalAmt}>{thb(booking.totalAmount)}</Text>
          </View>

          {booking.amountReceived != null && (
            <View style={S.balanceRow}>
              <Text style={S.balanceLabel}>Amount received</Text>
              <Text style={S.balanceAmt}>{thb(booking.amountReceived)}</Text>
            </View>
          )}
          {balance != null && balance > 0 && (
            <View style={S.balanceRow}>
              <Text style={[S.balanceLabel, { color: C.red }]}>Balance due</Text>
              <Text style={S.balanceDueAmt}>{thb(balance)}</Text>
            </View>
          )}
        </View>

        {/* Policies */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Policies</Text>
          <Text style={S.policyText}>
            Cancellations made 24+ hours before departure receive a full refund. No-shows and late cancellations are non-refundable. Please be ready at your pickup location 10 minutes before departure. The agency is not liable for personal belongings.
          </Text>
        </View>

        {/* Signature */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Customer Acknowledgement</Text>
          <Text style={{ fontSize: 8.5, color: C.gray7, marginBottom: 8 }}>
            By signing below, I confirm I have read and agree to the above policies.
          </Text>
          <View style={S.sigBox}>
            <Text style={S.sigLabel}>Signature &amp; date</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>Chiang Mai Clicks · Tour Management System</Text>
        <Text style={S.footerText}>{booking.bookingRef}</Text>
      </View>
    </Page>
  );
}

// ── Internal Receipt Page ─────────────────────────────────────────────────────
function InternalPage({ booking, bank }: { booking: BookingWithRelations; bank: Bank | null }) {
  const commissionLabel =
    booking.tours.commissionType === "PERCENTAGE"
      ? `Commission earned (Adult ${booking.tours.adultCommissionValue}% / Child ${booking.tours.childCommissionValue}%)`
      : `Commission earned (Adult THB ${booking.tours.adultCommissionValue} / Child THB ${booking.tours.childCommissionValue} per pax)`;

  const createdAt = new Date(booking.createdAt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
  const updatedAt = new Date(booking.updatedAt).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <Page size="A4" style={S.page}>
      {/* Header */}
      <View style={[S.headerBand, S.headerBandDark, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
        <View>
          <Text style={S.headerEyebrow}>CHIANG MAI CLICKS — INTERNAL</Text>
          <Text style={S.headerTitle}>Booking Detail</Text>
          <Text style={S.headerSubtitle}>Commission &amp; transfer summary</Text>
          <View style={S.headerBadgeRow}>
            <Chip label="Confidential" bg="#334155" color="#94a3b8" />
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7.5, color: "rgba(255,255,255,0.6)", marginBottom: 4, letterSpacing: 0.5 }}>BOOKING REF</Text>
          <Text style={{ fontSize: 15, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 10 }}>{booking.bookingRef}</Text>
          <Text style={{ fontSize: 8, color: "rgba(255,255,255,0.6)" }}>{formatDate(booking.bookingDate)}</Text>
        </View>
      </View>

      <View style={S.body}>
        {/* Tour details + Guest — side by side */}
        <View style={S.colRow}>
          {/* Left: Tour */}
          <View style={S.col}>
            <Text style={S.sectionTitle}>Tour Details</Text>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Tour</Text><Text style={S.kvValueCol}>{booking.tours.name}</Text></View>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Date</Text><Text style={S.kvValueCol}>{formatDate(booking.tourDate)}</Text></View>
            {booking.departureTime && (
              <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Departure</Text><Text style={S.kvValueCol}>{booking.departureTime}</Text></View>
            )}
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Provider</Text><Text style={S.kvValueCol}>{booking.tours.tour_providers.name}</Text></View>
          </View>

          {/* Right: Guest */}
          <View style={S.col}>
            <Text style={S.sectionTitle}>Guest</Text>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Name</Text><Text style={[S.kvValueCol, { fontFamily: "Helvetica-Bold" }]}>{booking.clients.fullName}</Text></View>
            <View style={S.kvRowCol}><Text style={S.kvLabelCol}>WhatsApp</Text><Text style={S.kvValueCol}>{booking.clients.whatsapp}</Text></View>
            {booking.pickup_locations && (
              <View style={S.kvRowCol}><Text style={S.kvLabelCol}>Pickup</Text><Text style={S.kvValueCol}>{booking.pickup_locations.name}</Text></View>
            )}
            <View style={S.kvRowCol}>
              <Text style={S.kvLabelCol}>Pax</Text>
              <Text style={S.kvValueCol}>
                {[
                  booking.adultPax > 0 && `${booking.adultPax} adult`,
                  booking.childPax > 0 && `${booking.childPax} child`,
                  booking.infantPax > 0 && `${booking.infantPax} infant`,
                ].filter(Boolean).join(" / ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Revenue Breakdown */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Revenue Breakdown</Text>
          <View style={S.revenueRow}>
            <Text style={S.revenueLabel}>Total collected from client</Text>
            <Text style={[S.revenueAmt, { fontFamily: "Helvetica-Bold" }]}>{thb(booking.totalAmount)}</Text>
          </View>
          <View style={S.revenueRow}>
            <Text style={[S.revenueLabel, { color: C.green }]}>{commissionLabel}</Text>
            <Text style={{ color: C.green, fontFamily: "Helvetica-Bold" }}>+{thb(booking.commissionAmount)}</Text>
          </View>
          <View style={S.netBox}>
            <Text style={S.netLabel}>Net to transfer</Text>
            <Text style={S.netAmt}>{thb(booking.netAmount)}</Text>
          </View>
        </View>

        {/* Price per pax */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Price per Pax</Text>
          <View style={S.paxRow}>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Adult</Text>
              <Text style={[S.paxCardCount, { fontSize: 13 }]}>{thb(booking.adultUnitPrice)}</Text>
              <Text style={S.paxCardRate}>{booking.adultPax} pax</Text>
            </View>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Child</Text>
              <Text style={[S.paxCardCount, { fontSize: 13 }]}>
                {booking.childUnitPrice > 0 ? thb(booking.childUnitPrice) : "Free"}
              </Text>
              <Text style={S.paxCardRate}>{booking.childPax} pax</Text>
            </View>
            <View style={S.paxCard}>
              <Text style={S.paxCardLabel}>Infant</Text>
              <Text style={[S.paxCardCount, { fontSize: 13 }]}>Free</Text>
              <Text style={S.paxCardRate}>{booking.infantPax} pax</Text>
            </View>
          </View>
        </View>

        {/* Provider bank details */}
        {bank && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Provider Bank Details</Text>
            <View style={S.bankCard}>
              <View style={S.bankIcon}>
                <Text style={S.bankIconText}>B</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.bankName}>{bank.bankName}</Text>
                <Text style={S.bankMeta}>{bank.accountName}</Text>
                <Text style={S.bankMeta}>{bank.accountNo}</Text>
                <Text style={[S.bankMeta, { marginTop: 4, color: C.amber, fontFamily: "Helvetica-Bold" }]}>
                  Transfer pending · {thb(booking.netAmount)} outstanding
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {booking.notes && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Internal Notes</Text>
            <Text style={{ color: C.gray7, lineHeight: 1.6 }}>{booking.notes}</Text>
          </View>
        )}

        {/* Audit */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Audit Trail</Text>
          <View style={S.auditRow}>
            <Text style={S.auditLabel}>Created</Text>
            <Text style={S.auditValue}>{createdAt}</Text>
          </View>
          <View style={S.auditRow}>
            <Text style={S.auditLabel}>Last updated</Text>
            <Text style={S.auditValue}>{updatedAt}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={S.footer}>
        <Text style={S.footerText}>Chiang Mai Clicks · INTERNAL — NOT FOR CLIENT DISTRIBUTION</Text>
        <Text style={S.footerText}>{booking.bookingRef}</Text>
      </View>
    </Page>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function BookingReceipt({ booking, bank }: { booking: BookingWithRelations; bank: Bank | null }) {
  return (
    <Document>
      <ClientPage booking={booking} />
      <InternalPage booking={booking} bank={bank} />
    </Document>
  );
}
