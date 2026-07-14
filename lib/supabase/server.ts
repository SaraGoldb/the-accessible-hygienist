// Same as client.ts, but for server-side code (Server Components, etc).
// Still using Clerk for auth, so we skip Supabase's normal cookie setup
// and just pass along the Clerk token instead.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function createClient() {
  // get the current user's Clerk token
  const { getToken } = await auth();

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { accessToken: () => getToken() }
  );
}