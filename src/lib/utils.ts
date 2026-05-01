import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDateInput(dateString: string): string {
  return new Date(dateString).toISOString().split("T")[0];
}

export function generateBookingRef(sequence: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  return `TMS-${y}-${String(sequence).padStart(4, "0")}`;
}

export function calculateCommission(
  commissionType: "FIXED" | "PERCENTAGE",
  adultCommissionValue: number,
  childCommissionValue: number,
  adultPax: number,
  adultAmount: number,
  childPax: number,
  childAmount: number,
): number {
  if (commissionType === "PERCENTAGE") {
    return (adultAmount * adultCommissionValue + childAmount * childCommissionValue) / 100;
  }
  return adultCommissionValue * adultPax + childCommissionValue * childPax;
}
