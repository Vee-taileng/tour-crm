import PageHeader from "@/components/ui/PageHeader";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClientRecord } from "../actions";

const INPUT =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent";

export default function NewClientPage() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
        <Link href="/clients" className="hover:text-gray-700">
          Clients
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">New Client</span>
      </div>
      <PageHeader title="New Client" className="mb-6" />

      <form action={createClientRecord} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input name="fullName" required className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp <span className="text-red-500">*</span>
          </label>
          <input name="whatsapp" required placeholder="+66 8x xxx xxxx" className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" className={INPUT} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
          <input name="nationality" placeholder="e.g. British" className={INPUT} />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Create Client
          </button>
          <Link
            href="/clients"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
