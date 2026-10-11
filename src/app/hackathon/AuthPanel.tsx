"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";
import { createSession } from "@/actions/hackathon-auth";
import { UnlockForm } from "./UnlockForm";

// ─── helpers ────────────────────────────────────────────────────────────────

function firebaseMessage(err: unknown): string {
  const code = (err as AuthError)?.code ?? "";
  if (process.env.NODE_ENV !== "production") {
    console.error("[Firebase Auth error]", code, err);
  }
  const map: Record<string, string> = {
    "auth/email-already-in-use": "That email already has an account. Sign in instead.",
    "auth/invalid-email": "That email doesn't look right.",
    "auth/weak-password": "Use at least 6 characters.",
    "auth/user-not-found": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/operation-not-allowed":
      "Email/Password sign-in is not enabled. Ask the organiser to enable it in Firebase Console.",
    "auth/configuration-not-found":
      "Firebase Auth is not configured. Email/Password sign-in may need to be enabled.",
    "auth/invalid-action-code": "This reset link is invalid or has expired. Request a new one.",
    "auth/missing-android-pkg-name": "Password reset is not configured correctly. Ask the organiser to check Firebase Auth.",
  };
  return map[code] ?? `Something went wrong (${code || "unknown"}). Please try again.`;
}

// ─── root panel ─────────────────────────────────────────────────────────────

export function AuthPanel() {
  const [mode, setMode] = useState<"signup" | "signin" | "forgot">("signup");
  const [notice, setNotice] = useState<string>();
  const [sharedEmail, setSharedEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const switchTo = (m: "signup" | "signin" | "forgot", emailPrefill?: string) => {
    setMode(m);
    setNotice(undefined);
    if (emailPrefill !== undefined) setSharedEmail(emailPrefill);
  };

  return (
    <div className="fall-card p-6 md:p-8">
      {signedIn ? (
        <div role="status">
          <p className="mono text-[var(--pumpkin)]">You’re signed up</p>
          <h2 className="display-wide mt-3 text-[1.9rem] leading-[1.05]">You’re in.</h2>
          <p className="mt-3 text-muted">Enter the submission code shared by the organizers to open the project submission page.</p>
          <UnlockForm open />
        </div>
      ) : (
        <>
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
            onClick={() => switchTo(id)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              mode === id || (id === "signin" && mode === "forgot")
                ? "bg-[var(--pumpkin)] text-white"
                : "text-muted hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        id="auth-panel"
        role="tabpanel"
        aria-labelledby={`auth-tab-${mode === "signup" ? "signup" : "signin"}`}
        className="mt-6"
      >
        {mode === "signup" && (
          <SignUpForm
            initialEmail={sharedEmail}
            onSwitchToSignIn={(email) => switchTo("signin", email)}
          />
        )}
        {mode === "signin" && (
          <SignInForm
            initialEmail={sharedEmail}
            notice={notice}
            onForgot={() => switchTo("forgot")}
            onSuccess={() => setSignedIn(true)}
          />
        )}
        {mode === "forgot" && (
          <ForgotPassword
            initialEmail={sharedEmail}
            onDone={() => {
              switchTo("signin");
              setNotice("Password reset email sent. Check your inbox.");
            }}
            onBack={() => switchTo("signin")}
          />
        )}
      </div>
        </>
      )}
    </div>
  );
}

// ─── sign up ─────────────────────────────────────────────────────────────────

function SignUpForm({
  initialEmail,
  onSwitchToSignIn,
}: {
  initialEmail?: string;
  onSwitchToSignIn?: (email: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [emailInUse, setEmailInUse] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function validate() {
    const errs: Record<string, string> = {};
    const normalizedEmail = email.trim().toLowerCase();
    const emailParts = normalizedEmail.split("@");
    if (!name.trim()) errs.name = "Tell us your name.";
    else if (name.length > 100) errs.name = "Keep it under 100 characters.";
    if (!email.trim()) errs.email = "We need your email.";
    else if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes(".") || emailParts[1].startsWith(".") || emailParts[1].endsWith(".")) {
      errs.email = "Enter a complete email address, like name@gmail.com.";
    }
    if (password.length < 6) errs.password = "Use at least 6 characters.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setError(undefined);
    setEmailInUse(false);

    startTransition(async () => {
      try {
        // 1. Create Firebase Auth user
        const cred = await createUserWithEmailAndPassword(clientAuth, email.trim(), password);
        // 2. Set display name in Firebase Auth
        await updateProfile(cred.user, { displayName: name.trim() });
        await sendEmailVerification(cred.user);
        await signOut(clientAuth);
        setError("Check your inbox and click the verification link. Then return here and sign in.");
      } catch (err: unknown) {
        const code = (err as AuthError)?.code ?? "";
        if (code === "auth/email-already-in-use") {
          setEmailInUse(true);
        }
        setError(firebaseMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Join the hackathon</h2>
        <p className="mt-2 text-sm text-muted">Create an account to take part. You'll use it to submit your project.</p>
      </div>

      <div>
        <label htmlFor="auth-name" className="mono text-muted">Name</label>
        <input
          id="auth-name"
          name="name"
          className="field mt-2"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "auth-name-error" : undefined}
        />
        {fieldErrors.name && (
          <p id="auth-name-error" className="mt-1.5 text-sm text-[var(--maroon)]">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="auth-email" className="mono text-muted">Email</label>
        <input
          id="auth-email"
          name="email"
          type="email"
          className="field mt-2"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailInUse) setEmailInUse(false);
          }}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p id="auth-email-error" className="mt-1.5 text-sm text-[var(--maroon)]">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="auth-password" className="mono text-muted">Password</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          className="field mt-2"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "auth-password-error" : undefined}
        />
        <p className="mt-1.5 text-sm text-faint">At least 6 characters.</p>
        {fieldErrors.password && (
          <p id="auth-password-error" className="mt-1.5 text-sm text-[var(--maroon)]">{fieldErrors.password}</p>
        )}
      </div>

      {error && (
        <div role="alert" className="grid gap-2">
          <p className="text-sm text-[var(--maroon)]">{error}</p>
          {emailInUse && onSwitchToSignIn && (
            <button
              type="button"
              onClick={() => onSwitchToSignIn(email.trim())}
              className="text-left text-sm text-[var(--pumpkin)] underline underline-offset-4"
            >
              Sign in with this email →
            </button>
          )}
        </div>
      )}

      <button type="submit" className="key key--primary w-full" disabled={pending}>
        <span>{pending ? "Signing up…" : "Sign up"}</span>
        <span className="key__hint" aria-hidden="true">↵</span>
      </button>
    </form>
  );
}

// ─── sign in ─────────────────────────────────────────────────────────────────

function SignInForm({
  initialEmail,
  notice,
  onForgot,
  onSuccess,
}: {
  initialEmail?: string;
  notice?: string;
  onForgot: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError(undefined);

    startTransition(async () => {
      try {
        // 1. Sign in with Firebase Auth
        const cred = await signInWithEmailAndPassword(clientAuth, email.trim(), password);
        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user);
          await signOut(clientAuth);
          setError("Verify your email first. We sent a new verification link.");
          return;
        }
        // 2. Get fresh ID token and hand it to the server
        const idToken = await cred.user.getIdToken();
        const result = await createSession(idToken, cred.user.displayName || undefined);
        if (result?.error) {
          setError(result.error);
        } else {
          onSuccess();
          router.refresh();
        }
      } catch (err) {
        setError(firebaseMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Welcome back</h2>
        <p className="mt-2 text-sm text-muted">Sign in with the account you made for the hackathon.</p>
      </div>

      {notice && (
        <p role="status" className="rounded-md border border-line px-3 py-2 text-sm">{notice}</p>
      )}

      <div>
        <label htmlFor="signin-email" className="mono text-muted">Email</label>
        <input
          id="signin-email"
          name="email"
          type="email"
          className="field mt-2"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="signin-password" className="mono text-muted">Password</label>
        <input
          id="signin-password"
          name="password"
          type="password"
          className="field mt-2"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={onForgot}
          className="mt-2 text-sm text-[var(--pumpkin)] underline underline-offset-4"
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--maroon)]">{error}</p>
      )}

      <button type="submit" className="key key--primary w-full" disabled={pending}>
        <span>{pending ? "Signing in…" : "Sign in"}</span>
        <span className="key__hint" aria-hidden="true">↵</span>
      </button>
    </form>
  );
}

// ─── forgot password ─────────────────────────────────────────────────────────
// Firebase sends the reset email directly — no custom codes needed.

function ForgotPassword({
  initialEmail,
  onDone,
  onBack,
}: {
  initialEmail?: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState(initialEmail || "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailParts = normalizedEmail.split("@");
    if (!normalizedEmail || emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes(".")) {
      setError("Enter the complete email you signed up with.");
      return;
    }
    setError(undefined);

    startTransition(async () => {
      try {
        await sendPasswordResetEmail(clientAuth, normalizedEmail);
        onDone(); // Switch back to sign-in with a success notice
      } catch (err) {
        const code = (err as AuthError)?.code ?? "";
        setError(firebaseMessage(err));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <h2 className="display-wide text-[1.6rem] leading-[1.05]">Forgot password</h2>
        <p className="mt-2 text-sm text-muted">
          Enter the email you signed up with and Firebase will send you a reset link.
        </p>
      </div>

      <div>
        <label htmlFor="forgot-email" className="mono text-muted">Email</label>
        <input
          id="forgot-email"
          name="email"
          type="email"
          className="field mt-2"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--maroon)]">{error}</p>
      )}

      <button type="submit" className="key key--primary w-full" disabled={pending}>
        <span>{pending ? "Sending…" : "Send reset link"}</span>
        <span className="key__hint" aria-hidden="true">↵</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted underline underline-offset-4 hover:text-fg"
      >
        Back to sign in
      </button>
    </form>
  );
}
