// ── Scalar enums ────────────────────────────────────────────────────────────

export type UserRole = "ADMIN";
export type TourCategory = "ADVENTURE" | "CULTURAL" | "ANIMALS" | "CULINARY";
export type TourType =
  | "ELEPHANTS"
  | "BAMBOO_RAFTING"
  | "COOKING_CLASS"
  | "MUAY_THAI"
  | "TEMPLE_TOUR"
  | "WATERFALLS";
export type TourStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type CommissionType = "FIXED" | "PERCENTAGE";
export type PaymentStatus = "UNPAID" | "DEPOSIT" | "PAID";
export type BookingStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "NO_SHOW";
export type BookingSource = "WALK_IN" | "WHATSAPP" | "WEBSITE" | "PARTNER";

// ── Supabase Database generic ────────────────────────────────────────────────
// Row shapes must use inline `type` objects (not interface references) so that
// they satisfy `Record<string, unknown>` as required by supabase-js generics.

export type Database = {
  public: {
    Tables: {
      tour_providers: {
        Row: {
          id: string;
          name: string;
          contactName: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          isActive: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          contactName?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          isActive?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contactName?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          isActive?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
      banks: {
        Row: {
          id: string;
          providerId: string;
          bankName: string;
          accountName: string;
          accountNo: string;
          isPrimary: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          providerId: string;
          bankName: string;
          accountName: string;
          accountNo: string;
          isPrimary?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          providerId?: string;
          bankName?: string;
          accountName?: string;
          accountNo?: string;
          isPrimary?: boolean;
          createdAt?: string;
        };
        Relationships: [
          {
            foreignKeyName: "banks_providerId_fkey";
            columns: ["providerId"];
            isOneToOne: false;
            referencedRelation: "tour_providers";
            referencedColumns: ["id"];
          },
        ];
      };
      tours: {
        Row: {
          id: string;
          name: string;
          category: TourCategory[];
          tourType: TourType;
          providerId: string;
          duration: string;
          departureTimes: string[];
          includeLunch: boolean;
          inclusions: string[];
          exclusions: string[];
          adultPrice: number;
          childPrice: number;
          infantPrice: number;
          commissionType: CommissionType;
          adultCommissionValue: number;
          childCommissionValue: number;
          minPax: number | null;
          maxPax: number | null;
          featuredImage: string | null;
          status: TourStatus;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: TourCategory[];
          tourType: TourType;
          providerId: string;
          duration: string;
          departureTimes?: string[];
          includeLunch?: boolean;
          inclusions?: string[];
          exclusions?: string[];
          adultPrice?: number;
          childPrice?: number;
          infantPrice?: number;
          commissionType: CommissionType;
          adultCommissionValue?: number;
          childCommissionValue?: number;
          minPax?: number | null;
          maxPax?: number | null;
          featuredImage?: string | null;
          status?: TourStatus;
        };
        Update: {
          id?: string;
          name?: string;
          category?: TourCategory[];
          tourType?: TourType;
          providerId?: string;
          duration?: string;
          departureTimes?: string[];
          includeLunch?: boolean;
          inclusions?: string[];
          exclusions?: string[];
          adultPrice?: number;
          childPrice?: number;
          infantPrice?: number;
          commissionType?: CommissionType;
          adultCommissionValue?: number;
          childCommissionValue?: number;
          minPax?: number | null;
          maxPax?: number | null;
          featuredImage?: string | null;
          status?: TourStatus;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          fullName: string;
          whatsapp: string;
          email: string | null;
          nationality: string | null;
          isRepeat: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          fullName: string;
          whatsapp: string;
          email?: string | null;
          nationality?: string | null;
          isRepeat?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          fullName?: string;
          whatsapp?: string;
          email?: string | null;
          nationality?: string | null;
          isRepeat?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
      pickup_locations: {
        Row: {
          id: string;
          name: string;
          zone: string | null;
          isActive: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          zone?: string | null;
          isActive?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          zone?: string | null;
          isActive?: boolean;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          bookingRef: string;
          clientId: string;
          tourId: string;
          tourDate: string;
          bookingDate: string;
          departureTime: string | null;
          adultPax: number;
          childPax: number;
          infantPax: number;
          pickupLocationId: string | null;
          hotelName: string | null;
          hotelRoom: string | null;
          notes: string | null;
          adultUnitPrice: number;
          childUnitPrice: number;
          infantUnitPrice: number;
          totalAmount: number;
          commissionAmount: number;
          netAmount: number;
          paymentStatus: PaymentStatus;
          amountReceived: number | null;
          bookingSource: BookingSource | null;
          bookingStatus: BookingStatus;
          createdBy: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          bookingRef?: string;
          clientId: string;
          tourId: string;
          tourDate: string;
          bookingDate?: string;
          departureTime?: string | null;
          adultPax?: number;
          childPax?: number;
          infantPax?: number;
          pickupLocationId?: string | null;
          hotelName?: string | null;
          hotelRoom?: string | null;
          notes?: string | null;
          adultUnitPrice: number;
          childUnitPrice: number;
          infantUnitPrice?: number;
          totalAmount: number;
          commissionAmount: number;
          netAmount: number;
          paymentStatus?: PaymentStatus;
          amountReceived?: number | null;
          bookingSource?: BookingSource | null;
          bookingStatus?: BookingStatus;
          createdBy: string;
        };
        Update: {
          tourDate?: string;
          departureTime?: string | null;
          adultPax?: number;
          childPax?: number;
          infantPax?: number;
          pickupLocationId?: string | null;
          hotelName?: string | null;
          hotelRoom?: string | null;
          notes?: string | null;
          paymentStatus?: PaymentStatus;
          amountReceived?: number | null;
          bookingSource?: BookingSource | null;
          bookingStatus?: BookingStatus;
        };
        Relationships: [];
      };
      provider_transfers: {
        Row: {
          id: string;
          providerId: string;
          bankId: string;
          transferDate: string;
          amount: number;
          referenceNo: string | null;
          notes: string | null;
          bookingIds: string[];
          loggedBy: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          providerId: string;
          bankId: string;
          transferDate: string;
          amount: number;
          referenceNo?: string | null;
          notes?: string | null;
          bookingIds?: string[];
          loggedBy: string;
          createdAt?: string;
        };
        Update: {
          transferDate?: string;
          amount?: number;
          referenceNo?: string | null;
          notes?: string | null;
          bookingIds?: string[];
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// ── Convenience row aliases (derive from the Database type) ──────────────────

export type TourProvider = Database["public"]["Tables"]["tour_providers"]["Row"];
export type Bank = Database["public"]["Tables"]["banks"]["Row"];
export type Tour = Database["public"]["Tables"]["tours"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type PickupLocation = Database["public"]["Tables"]["pickup_locations"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type ProviderTransfer = Database["public"]["Tables"]["provider_transfers"]["Row"];

// ── Joined types used in the UI ──────────────────────────────────────────────

export type TourWithProvider = Tour & { tour_providers: TourProvider };
export type BookingWithRelations = Booking & {
  clients: Client;
  tours: Tour & { tour_providers: TourProvider };
  pickup_locations: PickupLocation | null;
};
