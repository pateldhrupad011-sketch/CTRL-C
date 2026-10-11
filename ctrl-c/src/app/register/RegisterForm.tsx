"use client";

import { useActionState } from "react";
import { type InterestState, submitInterest } from "@/actions/interest";
import { involve } from "@/content/copy";
import { LIMITS } from "@/lib/interest";

const initial: InterestState = { status: "idle" };

export function RegisterForm() {
  const [state, action, pending] = useActionState(submitInterest, initial);
  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.errors : undefined;
  const fieldProps = (name: keyof NonNullable<typeof errors>) =>
    errors?.[name] ? { "aria-invalid": true as const, "aria-describedby": `register-${name}-error` } : {};
  const errorText = (name: keyof NonNullable<typeof errors>) =>
    errors?.[name] ? (
      <p id={`register-${name}-error`} className="mt-1.5 text-sm text-[#d4553a]">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form action={action} noValidate className="grid gap-6">
      <div>
        <label htmlFor="register-name" className="mono text-muted">
          Name
        </label>
        <input
          id="register-name"
          name="name"
          className="field mt-2"
          autoComplete="name"
          required
          maxLength={LIMITS.name}
          defaultValue={values?.name}
          {...fieldProps("name")}
        />
        {errorText("name")}
      </div>

      <div>
        <label htmlFor="register-email" className="mono text-muted">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          className="field mt-2"
          autoComplete="email"
          required
          maxLength={LIMITS.email}
          defaultValue={values?.email}
          {...fieldProps("email")}
        />
        {errorText("email")}
      </div>

      <div>
        <label htmlFor="register-phone" className="mono text-muted">
          Phone
        </label>
        <input
          id="register-phone"
          name="phone"
          type="tel"
          className="field mt-2"
          autoComplete="tel"
          required
          maxLength={LIMITS.phone}
          defaultValue={values?.phone}
          {...fieldProps("phone")}
        />
        {errorText("phone")}
      </div>

      <div>
        <label htmlFor="register-linkedin" className="mono text-muted">
          LinkedIn <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="register-linkedin"
          name="linkedin"
          type="url"
          className="field mt-2"
          placeholder="https://www.linkedin.com/in/your-name"
          maxLength={LIMITS.linkedin}
          defaultValue={values?.linkedin}
          {...fieldProps("linkedin")}
        />
        {errorText("linkedin")}
      </div>

      <div>
        <label htmlFor="register-homepage" className="mono text-muted">
          Personal website <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="register-homepage"
          name="homepage"
          type="url"
          className="field mt-2"
          placeholder="https://your-site.com"
          maxLength={LIMITS.website}
          defaultValue={values?.website}
          {...fieldProps("website")}
        />
        {errorText("website")}
      </div>

      <div>
        <label htmlFor="register-resume" className="mono text-muted">
          Resume <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="register-resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="field mt-2"
          {...fieldProps("resume")}
        />
        <p className="mt-1.5 text-sm text-muted">PDF, DOC or DOCX, up to 5 MB.</p>
        {errorText("resume")}
      </div>

      <div>
        <label htmlFor="register-message" className="mono text-muted">
          Anything else? <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="register-message"
          name="message"
          rows={4}
          className="field mt-2 resize-y"
          maxLength={LIMITS.message}
          defaultValue={values?.message}
          {...fieldProps("message")}
        />
        {errorText("message")}
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="register-website">Leave this empty</label>
        <input id="register-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-[#d4553a]">
          {state.message}
        </p>
      )}
      {errors && (
        <p role="alert" className="sr-only">
          Please fix the highlighted fields.
        </p>
      )}

      <div>
        <button type="submit" className="key key--primary w-full" disabled={pending}>
          <span>{pending ? "Sending…" : "Send"}</span>
          <span className="key__hint" aria-hidden="true">
            ↵
          </span>
        </button>
        <p className="mt-3 text-sm text-muted">{involve.form.privacy}</p>
      </div>
    </form>
  );
}
