//  makes your build fail if this file ever gets accidentally imported 
// into a client component, which would leak your secret key to the browser.
import 'server-only';

import { createClient } from '@supabase/supabase-js';

// Service role key bypasses RLS — never import this file in client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // different from your anon key
);