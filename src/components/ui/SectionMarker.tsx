type SectionMarkerProps = {
  sheet: string;
  label: string;
  className?: string;
  note?: string;
};

/** Drawing-sheet reference that opens each section: [02] About ───── Sheet 02 / 08 */
export function SectionMarker({ sheet, label, note, className = "" }: SectionMarkerProps) {
  return (
    <div className={`marker mono ${className}`}>
      <span className="marker__num" aria-hidden="true">
        {sheet}
      </span>
      <span className="text-fg">{label}</span>
      <span className="marker__rule draw-x" aria-hidden="true" />
      <span className="hidden sm:inline" aria-hidden="true">
        {note ?? `Sheet ${sheet} / 08`}
      </span>
    </div>
  );
}
