import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-5 py-16">
      <div className="absolute top-4 right-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <Wordmark className="text-[2rem]" />
        <h1 className="mt-8 font-display text-3xl font-bold tracking-tight">Admin sign in</h1>
        <p className="mt-2 text-muted">For Ctrl C organizers only.</p>
        <LoginForm />
      </div>
    </main>
  );
}
