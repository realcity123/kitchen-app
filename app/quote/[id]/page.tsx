import { redirect, notFound } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import QuoteFormClient from '@/components/QuoteFormClient';
import { generateQuoteNumber } from '@/lib/utils';

export default async function EditQuotePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const service = createServiceClient();

  const [{ data: quote }, { data: last }] = await Promise.all([
    service.from('quotes_portal').select('*').eq('id', params.id).single(),
    service.from('quotes_portal').select('quote_number').order('created_at', { ascending: false }).limit(1).single(),
  ]);

  if (!quote) notFound();

  const nextQuoteNumber = generateQuoteNumber(last?.quote_number || null);

  return <QuoteFormClient nextQuoteNumber={nextQuoteNumber} mode="edit" existingQuote={quote} />;
}
