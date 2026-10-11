"use client";

import { useFormStatus } from "react-dom";

export function DeleteProjectButton({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(`Delete the project from ${name}? This can’t be undone.`)) event.preventDefault();
      }}
      className="text-sm text-[#e5533d] underline underline-offset-4 disabled:opacity-60"
    >
      {pending ? "Deleting…" : "Delete project"}
    </button>
  );
}
