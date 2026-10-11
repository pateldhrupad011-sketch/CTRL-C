"use client";

import { useActionState } from "react";
import { unlockWithCode } from "@/actions/hackathon-config";

export function UnlockForm({ open }: { open: boolean }) {
  const [state, action, pending] = useActionState(unlockWithCode, {});

  return (
    <form action={action} className="mt-8 border-t border-dashed border-line-strong pt-6">
      <p className="mono text-[var(--pumpkin)]">{open ? "Submission access" : "Not open yet"}</p>
      <h3 className="display-wide mt-3 text-[1.8rem] leading-[1.05]">
        {open ? "Enter the code to submit." : "Submissions are locked."}
      </h3>
      <p className="mt-3 text-muted">
        {open
          ? "Organizers will give you this code when it is time to hand in your project."
          : "Come back when the organizers share the submission code."}
      </p>
      {open && (
        <label className="mt-6 grid gap-1.5">
          <span className="mono text-muted">Submission code</span>
          <input name="code" autoComplete="off" className="field" required />
        </label>
      )}
      {state.error && (
        <p role="alert" className="mt-4 text-sm text-[#d4553a]">
          {state.error}
        </p>
      )}
      {open && (
        <button type="submit" className="key key--primary mt-6 w-full" disabled={pending}>
          <span>{pending ? "Checking…" : "Open submission"}</span>
        </button>
      )}
    </form>
  );
}
