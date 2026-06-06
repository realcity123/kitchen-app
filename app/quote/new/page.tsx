import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import QuoteFormClient from '@/components/QuoteFormClient';
import { generateQuoteNumber } from '@/lib/utils';

export default async function NewQuotePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const service = createServiceClient();
  const { data: last } = await service
    .from('quotes_portal')
    .select('quote_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const nextQuoteNumber = generateQuoteNumber(last?.quote_number || null);

  return <QuoteFormClient nextQuoteNumber={nextQuoteNumber} mode="new" />;
}
