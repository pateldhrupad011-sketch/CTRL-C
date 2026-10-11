"use client";

import { useActionState, useState } from "react";
import {
  type AuthField,
  type AuthState,
  type ResetState,
  confirmPasswordReset,
  requestPasswordReset,
  signIn,
  signUp,
} from "@/actions/hackathon-auth";

export function AuthPanel() {
  const [mode, setMode] = useState<"signup" | "signin" | "forgot">("signup");
  const [notice, setNotice] = useState<string>();

  return (
    <div className="fall-card p-6 md:p-8">
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-lg border border-line p-1">
        {(
          [
            ["signup", "Sign up"],
            ["signin", "Sign in"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`auth-tab-${id}`}
            aria-selected={mode === id || (id === "signin" && mode === "forgot")}
            aria-controls="auth-panel"
            onClick={() => {
              setMode(id);
              setNotice(undefined);
            }}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              mode === id || (id === "signin" && mode === "forgot") ? "bg-[var(--pumpkin)] text-white" : "text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${mode === "signup" ? "signup" : "signin"}`} className="mt-6">
        {mode === "signup" && <SignUpForm />}
        {mode === "signin" && <SignInForm notice={notice} onForgot={() => setMode("forgot")} />}
        {mode === "forgot" && (
          <ForgotPassword
            onDone={() => {
              setNotice("Password updated. Sign in with your new password.");
              setMode("signin");
            }}
            onBack={() => setMode("signin")}
          />
        )}
      </div>
    </div>
  );
}

function useFieldHelpers(state: AuthState) {
  const fieldProps = (name: AuthField) =>
    state.errors?.[name] ? { "aria-invalid": true as const, "aria-describedby": `auth-${name}-error` } : {};
  const errorText = (name: AuthField) =>
    state.errors?.[name] ? (
      <p id={`auth-${name}-error`} className="mt-1.5 text-sm text-[var(--maroon)]">
        {state.errors[name]}
      </p>
    ) : null;
  return { fieldProps, errorText };
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, {});
  const { fieldProps, errorText } = useFieldHelpers(state);

  return (
    <form action={action} noValidate className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Join the hackathon</h2>
        <p className="mt-2 text-sm text-muted">Create an account to take part. You’ll use it to submit your project.</p>
      </div>
      <div>
        <label htmlFor="auth-name" className="mono text-muted">
          Name
        </label>
        <input id="auth-name" name="name" className="field mt-2" autoComplete="name" required defaultValue={state.name} {...fieldProps("name")} />
        {errorText("name")}
      </div>
      <div>
        <label htmlFor="auth-email" className="mono text-muted">
          Email
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          className="field mt-2"
          autoComplete="email"
          required
          defaultValue={state.email}
          {...fieldProps("email")}
        />
        {errorText("email")}
      </div>
      <div>
        <label htmlFor="auth-password" className="mono text-muted">
          Password
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          className="field mt-2"
          autoComplete="new-password"
          minLength={8}
          required
          {...fieldProps("password")}
        />
        <p className="mt-1.5 text-sm text-faint">At least 8 characters.</p>
        {errorText("password")}
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--maroon)]">
          {state.error}
        </p>
      )}
      <button type="submit" className="key key--primary w-full" disabled={pending}>
        <span>{pending ? "Signing up…" : "Sign up"}</span>
        <span className="key__hint" aria-hidden="true">
          ↵
        </span>
      </button>
    </form>
  );
}

function SignInForm({ notice, onForgot }: { notice?: string; onForgot: () => void }) {
  const [state, action, pending] = useActionState(signIn, {});

  return (
    <form action={action} className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Welcome back</h2>
        <p className="mt-2 text-sm text-muted">Sign in with the account you made for the hackathon.</p>
      </div>
      {notice && (
        <p role="status" className="rounded-md border border-line px-3 py-2 text-sm">
          {notice}
        </p>
      )}
      <div>
        <label htmlFor="signin-email" className="mono text-muted">
          Email
        </label>
        <input id="signin-email" name="email" type="email" className="field mt-2" autoComplete="email" required defaultValue={state.email} />
      </div>
      <div>
        <label htmlFor="signin-password" className="mono text-muted">
          Password
        </label>
        <input id="signin-password" name="password" type="password" className="field mt-2" autoComplete="current-password" required />
        <button type="button" onClick={onForgot} className="mt-2 text-sm text-[var(--pumpkin)] underline underline-offset-4">
          Forgot password?
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--maroon)]">
          {state.error}
        </p>
      )}
      <button type="submit" className="key key--primary w-full" disabled={pending}>
        <span>{pending ? "Signing in…" : "Sign in"}</span>
        <span className="key__hint" aria-hidden="true">
          ↵
        </span>
      </button>
    </form>
  );
}

function ForgotPassword({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [request, requestAction, requesting] = useActionState(requestPasswordReset, { step: "email" } as ResetState);
  const [confirm, confirmAction, confirming] = useActionState(confirmPasswordReset, { step: "code" } as ResetState);

  if (confirm.step === "done") {
    return (
      <div role="status" className="grid gap-4">
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Password updated</h2>
        <p className="text-sm text-muted">You can now sign in with your new password.</p>
        <button type="button" className="key key--primary w-full" onClick={onDone}>
          <span>Back to sign in</span>
          <span className="key__hint" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    );
  }

  if (request.step === "code") {
    return (
      <form action={confirmAction} className="grid gap-4">
        <div>
          <h2 className="display-wide text-[1.6rem] leading-[1.05]">Check your email</h2>
          <p className="mt-2 text-sm text-muted">
            If <span className="text-fg">{request.email}</span> has an account, we sent it a 6-digit code. It expires in 15
            minutes.
          </p>
        </div>
        <input type="hidden" name="email" value={request.email} />
        <div>
          <label htmlFor="reset-code" className="mono text-muted">
            Code
          </label>
          <input
            id="reset-code"
            name="code"
            className="field mt-2 tracking-[0.3em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
        </div>
        <div>
          <label htmlFor="reset-password" className="mono text-muted">
            New password
          </label>
          <input id="reset-password" name="password" type="password" className="field mt-2" autoComplete="new-password" minLength={8} required />
          <p className="mt-1.5 text-sm text-faint">At least 8 characters.</p>
        </div>
        {confirm.error && (
          <p role="alert" className="text-sm text-[var(--maroon)]">
            {confirm.error}
          </p>
        )}
        <button type="submit" className="key key--primary w-full" disabled={confirming}>
          <span>{confirming ? "Saving…" : "Reset password"}</span>
          <span className="key__hint" aria-hidden="true">
            ↵
          </span>
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Forgot password</h2>
        <p className="mt-2 text-sm text-muted">Enter the email you signed up with and we’ll send you a code.</p>
      </div>
      <div>
        <label htmlFor="forgot-email" className="mono text-muted">
          Email
        </label>
        <input id="forgot-email" name="email" type="email" className="field mt-2" autoComplete="email" required defaultValue={request.email} />
      </div>
      {request.error && (
        <p role="alert" className="text-sm text-[var(--maroon)]">
          {request.error}
        </p>
      )}
      <button type="submit" className="key key--primary w-full" disabled={requesting}>
        <span>{requesting ? "Sending…" : "Send code"}</span>
        <span className="key__hint" aria-hidden="true">
          ↵
        </span>
      </button>
      <button type="button" onClick={onBack} className="text-sm text-muted underline underline-offset-4 hover:text-fg">
        Back to sign in
      </button>
    </form>
  );
}
