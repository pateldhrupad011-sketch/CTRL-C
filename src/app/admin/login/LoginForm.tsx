"use client";

import { useActionState } from "react";
import { login } from "@/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="mt-8 grid gap-5">
      <div>
        <label htmlFor="admin-username" className="mono text-muted">
          Username
        </label>
        <input
          id="admin-username"
          name="username"
          className="field mt-2"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.username}
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mono text-muted">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          className="field mt-2"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-[#e5533d] dark:text-[#ff9b8a]">
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
