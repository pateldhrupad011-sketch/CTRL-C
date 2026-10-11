/**
 * Inline script that executes during HTML parsing on hard loads.
 * On the client the type becomes text/plain so React never tries to run it again.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
