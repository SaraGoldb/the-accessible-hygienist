import type { Metadata } from "next";
import { ClerkProvider, Show, UserButton } from '@clerk/nextjs'
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Accessible Hygienist",
  description: "Oral care session tracker for dementia caregivers · by Erica Solomon, RDH",
};

// use font variable names instead of className so the variable can be used anywhere in the app, not just on the body
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
        <body className={`${playfairDisplay.variable} ${lato.variable}`}>
          <ClerkProvider>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { rootBox: "fixed top-7 right-7 z-50"}}}/>
            </Show>
            {children}
          </ClerkProvider>
        </body>
      </html>
  );
}