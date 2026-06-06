import { Quote } from '@/types/quote';
import { formatCurrency, formatDate } from '@/lib/utils';

type Props = {
  quote: Partial<Quote> & {
    quote_number?: string; quote_date?: string; client_name?: string;
    client_address?: string; client_city?: string; project_address?: string; project_city?: string;
    line_items?: { description: string; amount: number }[];
    subtotal?: number; hst?: number; total?: number; notes?: string; status?: string;
  };
};

export default function QuotePreview({ quote }: Props) {
  const items = quote.line_items || [];
  const subtotal = quote.subtotal ?? 0;
  const hst = quote.hst ?? 0;
  const total = quote.total ?? 0;
  const isPaid = quote.status === 'paid';
  const docType = isPaid ? 'RECEIPT' : 'QUOTATION';

  return (
    <div id="quote-preview" style={{ backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif", width: '100%', maxWidth: '794px', margin: '0 auto', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1c1a17', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: '#c2974a', fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1 }}>
            My<em>Kitchen</em>Upgrade<span style={{ fontSize: '13px', verticalAlign: 'super' }}>.CA</span>
          </div>
          <div style={{ color: '#a59c8d', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px', marginTop: '6px' }}>
            Bespoke Kitchen Design · GTA
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'white', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>{docType}</div>
          <div style={{ color: '#c2974a', fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>#{quote.quote_number || 'MK-001'}</div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '8px' }}>Date: {quote.quote_date ? formatDate(quote.quote_date) : '—'}</div>
          {quote.status && (
            <div style={{ marginTop: '8px', display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: isPaid ? '#16a34a' : '#a67c30', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isPaid ? 'PAID' : 'PENDING'}
            </div>
          )}
        </div>
      </div>

      {/* Contact strip */}
      <div style={{ backgroundColor: '#1c1a17', padding: '0 40px 20px', display: 'flex', gap: '20px' }}>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>mykitchenupgrade.ca</span>
        <span style={{ color: '#9ca3af', fontSize: '12px' }}>hello@mykitchenupgrade.ca</span>
      </div>

      {/* Gold rule */}
      <div style={{ height: '4px', backgroundColor: '#c2974a' }} />

      {/* Bill To / Project Address */}
      <div style={{ padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1c1a17', marginBottom: '4px' }}>{quote.client_name || '—'}</div>
          {quote.client_address && <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '2px' }}>{quote.client_address}</div>}
          {quote.client_city && <div style={{ fontSize: '13px', color: '#4b5563' }}>{quote.client_city}</div>}
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Project Address</div>
          {(quote.project_address || quote.project_city) ? (
            <>
              {quote.project_address && <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '2px' }}>{quote.project_address}</div>}
              {quote.project_city && <div style={{ fontSize: '13px', color: '#4b5563' }}>{quote.project_city}</div>}
            </>
          ) : <div style={{ fontSize: '13px', color: '#9ca3af' }}>Same as billing address</div>}
        </div>
      </div>

      {/* Line Items */}
      <div style={{ padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', padding: '12px 0', borderBottom: '2px solid #1c1a17', marginTop: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1c1a17', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1c1a17', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Amount</div>
        </div>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: '14px', color: '#374151' }}>{item.description || '—'}</div>
            <div style={{ fontSize: '14px', color: '#1c1a17', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{formatCurrency(Number(item.amount) || 0)}</div>
          </div>
        )) : (
          <div style={{ padding: '20px 0', fontSize: '14px', color: '#9ca3af', textAlign: 'center' }}>No line items yet</div>
        )}
      </div>

      {/* Gold rule */}
      <div style={{ height: '3px', backgroundColor: '#c2974a', margin: '0 40px' }} />

      {/* Totals */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '240px' }}>
          {[['Subtotal', formatCurrency(subtotal)], ['HST (13%)', formatCurrency(hst)]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>{l}</span>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: isPaid ? '#16a34a' : '#1c1a17', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isPaid ? 'Amount Paid' : 'Total'}</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: isPaid ? 'white' : '#c2974a' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div style={{ padding: '0 40px 20px' }}>
          <div style={{ backgroundColor: '#fdf8f0', borderRadius: '8px', padding: '14px', border: '1px solid #e6ddcf' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Notes</div>
            <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{quote.notes}</div>
          </div>
        </div>
      )}

      {/* Gold rule */}
      <div style={{ height: '3px', backgroundColor: '#c2974a' }} />

      {/* Business info */}
      <div style={{ padding: '20px 40px', backgroundColor: '#fdf8f0', borderTop: '1px solid #e6ddcf' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1c1a17', marginBottom: '6px' }}>MyKitchenUpgrade.ca</div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.8' }}>
              Licensed · Insured · 10-Year Warranty<br />
              GTA Kitchen Design & Renovation<br />
              hello@mykitchenupgrade.ca
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1c1a17', marginBottom: '6px' }}>Contact</div>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.8' }}>
              (905) 555-0199<br />
              HST #: [Your HST Number]
            </div>
          </div>
        </div>
      </div>

      {/* Gold rule */}
      <div style={{ height: '3px', backgroundColor: '#c2974a' }} />

      {/* Payment terms */}
      <div style={{ padding: '20px 40px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{isPaid ? 'Payment Status' : 'Payment Terms'}</div>
            {isPaid ? (
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>Payment Received — Thank You!</div>
            ) : (
              <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>
                50% deposit required to begin work<br />
                Balance due upon project completion
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Warranty</div>
            <div style={{ fontSize: '12px', color: '#374151', lineHeight: '1.7' }}>10-year workmanship warranty on all work performed</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: '#1c1a17', padding: '16px 40px', textAlign: 'center' }}>
        <div style={{ color: '#c2974a', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Thank you for choosing MyKitchenUpgrade.ca</div>
        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Questions? Call (905) 555-0199</div>
      </div>
    </div>
  );
}
