import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin · Ctrl C" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-bg text-fg">{children}</div>;
}
