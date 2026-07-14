// [[...sign-in]] is an optional catch-all route that matches any number of extra URL segments 
// (for things like redirects, verification, or OAuth callbacks)

// Ref: https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sage-light via-white to-blue/10 flex flex-col">
      <div className="flex flex-col items-center gap-4 px-5 pt-14 text-center">
        <div className="w-16 h-16 rounded-full bg-linear-to-br from-sage to-blue flex items-center justify-center text-4xl shrink-0">
          🦷
        </div>
        <div className="text-4xl font-extrabold text-ink font-display leading-tight">
        The Accessible Hygienist
        </div>
        <div className="text-base text-ink-light font-body tracking-wide">
        Care Tracker · by Erica Solomon, RDH
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-20">
        <SignIn />
      </div>
    </div>
  );
}