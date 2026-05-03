"use client";

import { deleteProvider } from "../actions";

export default function DeleteProviderButton({ id }: { id: string }) {
  const action = deleteProvider.bind(null, id);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this provider? All bank accounts will also be removed. This cannot be undone."))
          e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-red-600 hover:text-red-700 font-medium">
        Delete Provider
      </button>
    </form>
  );
}
