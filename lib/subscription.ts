import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export async function hasActiveAccess(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('clerk_user_id', userId)
    .single();

  return data?.status === 'trialing' || data?.status === 'active';
}