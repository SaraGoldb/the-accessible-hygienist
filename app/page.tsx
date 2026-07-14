// Server component — just renders the client app. Kept separate from
// HomePage so this file can stay a server component
// (no "use client"), which is the Next.js App Router convention.
import HomePage from "@/components/HomePage";

export default function Home() {
  return <HomePage />;
}
