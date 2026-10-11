"use client";

import { useFormStatus } from "react-dom";

export function DeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(`Delete the submission from ${name}? This can’t be undone.`)) event.preventDefault();
      }}
      className="rounded-lg border border-[#e5533d] px-4 py-2 text-sm font-medium text-[#e5533d] transition-colors hover:bg-[#e5533d] hover:text-white disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete submission"}
    </button>
  );
}
