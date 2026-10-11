import type { Metadata } from "next";
import { NotFoundStage } from "@/components/NotFoundStage";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page didn’t copy.",
};

export default function NotFound() {
  return <NotFoundStage />;
}
