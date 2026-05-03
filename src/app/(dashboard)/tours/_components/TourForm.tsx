"use client";

import { useState, useRef } from "react";
import { Plus, X, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Tour, TourProvider, TourCategory } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { createTour, updateTour } from "../actions";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

const TOUR_TYPES = [
  { value: "ELEPHANTS", label: "Elephants" },
  { value: "BAMBOO_RAFTING", label: "Bamboo Rafting" },
  { value: "COOKING_CLASS", label: "Cooking Class" },
  { value: "MUAY_THAI", label: "Muay Thai" },
  { value: "TEMPLE_TOUR", label: "Temple Tour" },
  { value: "WATERFALLS", label: "Waterfalls" },
];

const CATEGORIES: { value: TourCategory; label: string }[] = [
  { value: "ADVENTURE", label: "Adventure" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "ANIMALS", label: "Animals" },
  { value: "CULINARY", label: "Culinary" },
];

type Props = {
  providers: TourProvider[];
  tour?: Tour;
};

export default function TourForm({ providers, tour }: Props) {
  const [departureTimes, setDepartureTimes] = useState<string[]>(
    tour?.departureTimes ?? []
  );
  const [inclusions, setInclusions] = useState<string[]>(
    tour?.inclusions ?? []
  );
  const [exclusions, setExclusions] = useState<string[]>(
    tour?.exclusions ?? []
  );
  const [newDeparture, setNewDeparture] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [imageUrl, setImageUrl] = useState<string>(tour?.featuredImage ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const action = tour ? updateTour.bind(null, tour.id) : createTour;

  async function handleImageFile(file: File) {
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `tours/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("tour-images")
      .upload(path, file, { upsert: true });
    if (error) {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("tour-images")
      .getPublicUrl(data.path);
    setImageUrl(publicUrl);
    setUploading(false);
  }

  function addItem(
    list: string[],
    setList: (l: string[]) => void,
    value: string,
    setValue: (v: string) => void
    
  ) {
    if (!value.trim()) return;
    setList([...list, value.trim()]);
    setValue("");
  }

  function removeItem(
    list: string[],
    setList: (l: string[]) => void,
    index: number
  ) {
    setList(list.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              defaultValue={tour?.name}
              required
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tour Type <span className="text-red-500">*</span>
            </label>
            <select
              name="tourType"
              defaultValue={tour?.tourType ?? ""}
              required
              className={INPUT}
            >
              <option value="">Select type…</option>
              {TOUR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider <span className="text-red-500">*</span>
            </label>
            <select
              name="providerId"
              defaultValue={tour?.providerId ?? ""}
              required
              className={INPUT}
            >
              <option value="">Select provider…</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration <span className="text-red-500">*</span>
            </label>
            <input
              name="duration"
              defaultValue={tour?.duration}
              placeholder="e.g. Full Day (8 hrs)"
              required
              className={INPUT}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              defaultValue={tour?.status ?? "DRAFT"}
              className={INPUT}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories
          </label>
          <div className="flex flex-wrap gap-4">
            {CATEGORIES.map((c) => (
              <label
                key={c.value}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="category"
                  value={c.value}
                  defaultChecked={tour?.category.includes(c.value)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="includeLunch"
            value="true"
            defaultChecked={tour?.includeLunch}
            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          Includes lunch
        </label>

        {/* Featured image */}
        <input type="hidden" name="featuredImage" value={imageUrl} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="flex items-start gap-4">
            {imageUrl ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                <Image src={imageUrl} alt="Tour image" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 bg-gray-50">
                {uploading ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-gray-300" />
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? "Uploading…" : imageUrl ? "Change image" : "Upload image"}
              </button>
              <p className="text-xs text-gray-400">
                JPG, PNG or WebP. Stored in Supabase Storage bucket{" "}
                <code className="bg-gray-100 px-1 rounded">tour-images</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Pricing & Commission</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adult Price (฿) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="adultPrice"
              defaultValue={tour?.adultPrice ?? 0}
              min="0"
              step="0.01"
              required
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Price (฿)
            </label>
            <input
              type="number"
              name="childPrice"
              defaultValue={tour?.childPrice ?? 0}
              min="0"
              step="0.01"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Infant Price (฿)
            </label>
            <input
              type="number"
              name="infantPrice"
              defaultValue={tour?.infantPrice ?? 0}
              min="0"
              step="0.01"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commission Type
            </label>
            <select
              name="commissionType"
              defaultValue={tour?.commissionType ?? "FIXED"}
              className={INPUT}
            >
              <option value="FIXED">Fixed per pax (฿)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adult Commission
            </label>
            <input
              type="number"
              name="adultCommissionValue"
              defaultValue={tour?.adultCommissionValue ?? 0}
              min="0"
              step="0.01"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Commission
            </label>
            <input
              type="number"
              name="childCommissionValue"
              defaultValue={tour?.childCommissionValue ?? 0}
              min="0"
              step="0.01"
              className={INPUT}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Pax
            </label>
            <input
              type="number"
              name="minPax"
              defaultValue={tour?.minPax ?? ""}
              min="1"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Pax
            </label>
            <input
              type="number"
              name="maxPax"
              defaultValue={tour?.maxPax ?? ""}
              min="1"
              className={INPUT}
            />
          </div>
        </div>
      </div>

      {/* Departure Times */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-medium text-gray-900">Departure Times</h2>
        {departureTimes.map((t, i) => (
          <input key={i} type="hidden" name="departureTimes" value={t} />
        ))}
        <div className="flex flex-wrap gap-2">
          {departureTimes.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-lg"
            >
              {t}
              <button
                type="button"
                onClick={() => removeItem(departureTimes, setDepartureTimes, i)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {departureTimes.length === 0 && (
            <span className="text-sm text-gray-400">No departure times added</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={newDeparture}
            onChange={(e) => setNewDeparture(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem(departureTimes, setDepartureTimes, newDeparture, setNewDeparture);
              }
            }}
          />
          <button
            type="button"
            onClick={() =>
              addItem(departureTimes, setDepartureTimes, newDeparture, setNewDeparture)
            }
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-medium text-gray-900">Inclusions</h2>
          {inclusions.map((item, i) => (
            <input key={i} type="hidden" name="inclusions" value={item} />
          ))}
          <ul className="space-y-1.5">
            {inclusions.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-gray-700"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(inclusions, setInclusions, i)}
                  className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              placeholder="e.g. Hotel pickup"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem(inclusions, setInclusions, newInclusion, setNewInclusion);
                }
              }}
            />
            <button
              type="button"
              onClick={() =>
                addItem(inclusions, setInclusions, newInclusion, setNewInclusion)
              }
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-medium text-gray-900">Exclusions</h2>
          {exclusions.map((item, i) => (
            <input key={i} type="hidden" name="exclusions" value={item} />
          ))}
          <ul className="space-y-1.5">
            {exclusions.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-sm text-gray-700"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeItem(exclusions, setExclusions, i)}
                  className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={newExclusion}
              onChange={(e) => setNewExclusion(e.target.value)}
              placeholder="e.g. Personal expenses"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem(exclusions, setExclusions, newExclusion, setNewExclusion);
                }
              }}
            />
            <button
              type="button"
              onClick={() =>
                addItem(exclusions, setExclusions, newExclusion, setNewExclusion)
              }
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {tour ? "Save Changes" : "Create Tour"}
        </button>
        <Link
          href="/tours"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
