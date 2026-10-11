type WordmarkProps = {
  className?: string;
  /** Set when the surrounding element already provides the accessible name. */
  decorative?: boolean;
};

export function Wordmark({ className = "", decorative = false }: WordmarkProps) {
  return (
    <span
      className={`wordmark ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Ctrl C"}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="wordmark__ctrl">ctrl</span>
      <span className="wordmark__c">C</span>
    </span>
  );
}
