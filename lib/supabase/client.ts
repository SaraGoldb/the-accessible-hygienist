// Supabase client for the browser. 
// We use Clerk for auth (not Supabase's own login), so every request 
// carries a Clerk token instead of a Supabase session. 
// Supabase trusts that token because of the Clerk <-> Supabase  
// Third-Party Auth connection set up in the dashboard.
"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

export function useSupabaseClient() {
  // get the current user's Clerk token
  const { getToken } = useAuth();

  // Only rebuild the client if getToken changes (e.g. login/logout)
  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        // Instead of Supabase reading its own session, it calls this
        // function to get a fresh Clerk token on every request.
        { accessToken: () => getToken() }
      ),
    [getToken]
  );
}