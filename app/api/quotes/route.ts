import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateTotals, generateQuoteNumber } from '@/lib/utils';
import { LineItem } from '@/types/quote';

export async function GET() {
  try {
    const service = createServiceClient();
    const { data, error } = await service.from('quotes_portal').select('*').neq('status', 'deleted').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const service = createServiceClient();
    const body = await req.json();
    const { quote_number, quote_date, client_name, client_email, client_address, client_city, project_address, project_city, line_items, notes } = body;

    if (!quote_date) return NextResponse.json({ error: 'Quote date is required' }, { status: 400 });
    if (!client_name) return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
    if (!line_items?.length) return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });

    const totals = calculateTotals(line_items as LineItem[]);

    let finalNumber = quote_number;
    if (!finalNumber) {
      const { data: last } = await service.from('quotes_portal').select('quote_number').order('created_at', { ascending: false }).limit(1).single();
      finalNumber = generateQuoteNumber(last?.quote_number || null);
    }

    const { data, error } = await service.from('quotes_portal').insert({
      quote_number: finalNumber, quote_date, client_name,
      ...(client_email ? { client_email } : {}),
      client_address: client_address || null, client_city: client_city || null,
      project_address: project_address || null, project_city: project_city || null,
      line_items, ...totals, status: 'unpaid', notes: notes || null,
    }).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
