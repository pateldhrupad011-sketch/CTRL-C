import type { Metadata } from "next";
import { ThanksMotion } from "./ThanksMotion";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your interest reached the Ctrl C organizers.",
};

export default function ThanksPage() {
  return <ThanksMotion />;
}
