"use client";

import { useActionState } from "react";
import { saveSubmissionCode } from "@/actions/hackathon-config";

export function SubmissionCodeForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState(saveSubmissionCode, {});

  return (
    <form action={action} className="mt-8 grid gap-4 rounded-xl border border-line p-5 md:p-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Submission code</h2>
        <p className="mt-2 max-w-2xl text-muted">
          People who sign up still need this code before they can open the project form. Share it when you want
          submissions to start.
        </p>
      </div>
      <label className="grid max-w-md gap-1.5">
        <span className="mono text-muted">Code</span>
        <input name="submissionCode" defaultValue={code} className="field" required minLength={4} maxLength={40} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="key key--primary" disabled={pending}>
          <span>{pending ? "Saving…" : "Save code"}</span>
        </button>
        {state.error && (
          <p role="alert" className="text-sm text-[#d4553a]">
            {state.error}
          </p>
        )}
        {state.ok && !pending && (
          <p role="status" key={state.at} className="text-sm text-muted">
            Saved. Signed-in participants will need this code to submit.
          </p>
        )}
      </div>
    </form>
  );
}
