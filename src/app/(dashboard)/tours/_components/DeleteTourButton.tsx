"use client";

import { deleteTour } from "../actions";

export default function DeleteTourButton({ id }: { id: string }) {
  const action = deleteTour.bind(null, id);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this tour? This cannot be undone.")) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-red-600 hover:text-red-700 font-medium">
        Delete Tour
      </button>
    </form>
  );
}
