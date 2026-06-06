import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { calculateTotals } from '@/lib/utils';
import { LineItem } from '@/types/quote';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = createServiceClient();
    const body = await req.json();

    // If updating status only (mark paid)
    if (body.status && Object.keys(body).length <= 2) {
      const { data, error } = await service.from('quotes_portal').update(body).eq('id', params.id).select().single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Full update
    const { quote_number, quote_date, client_name, client_email, client_address, client_city, project_address, project_city, line_items, notes } = body;
    const totals = calculateTotals((line_items || []) as LineItem[]);

    const { data, error } = await service.from('quotes_portal').update({
      quote_number, quote_date, client_name, client_email: client_email || null,
      client_address: client_address || null, client_city: client_city || null,
      project_address: project_address || null, project_city: project_city || null,
      line_items, ...totals, notes: notes || null,
    }).eq('id', params.id).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = createServiceClient();
    const { error } = await service.from('quotes_portal').update({ status: 'deleted' }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
