import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const service = createServiceClient();

  // Get user profile
  const { data: profile } = await service
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const userProfile = profile || { id: user.id, email: user.email || '', name: user.email || '', role: 'contractor' };

  // Get quotes
  const { data: quotes } = await service
    .from('quotes_portal')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  return <DashboardClient quotes={quotes || []} userProfile={userProfile} />;
}
