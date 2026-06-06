'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, LineItem } from '@/types/quote';
import QuotePreview from './QuotePreview';
import { calculateTotals, getTodayString } from '@/lib/utils';
import { Plus, Trash2, Save, Download } from 'lucide-react';

interface Props {
  nextQuoteNumber: string;
  mode: 'new' | 'edit';
  existingQuote?: Quote | null;
}

interface FormState {
  quote_number: string; quote_date: string;
  client_name: string; client_email: string; client_address: string; client_city: string;
  project_address: string; project_city: string;
  line_items: LineItem[]; notes: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

export default function QuoteFormClient({ nextQuoteNumber, mode, existingQuote }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [sameAsClient, setSameAsClient] = useState(false);

  const [form, setForm] = useState<FormState>({
    quote_number: existingQuote?.quote_number || nextQuoteNumber,
    quote_date: existingQuote?.quote_date || getTodayString(),
    client_name: existingQuote?.client_name || '',
    client_email: existingQuote?.client_email || '',
    client_address: existingQuote?.client_address || '',
    client_city: existingQuote?.client_city || '',
    project_address: existingQuote?.project_address || '',
    project_city: existingQuote?.project_city || '',
    line_items: existingQuote?.line_items || [{ description: '', amount: 0 }],
    notes: existingQuote?.notes || '',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const totals = calculateTotals(form.line_items);

  const previewData = {
    ...form,
    ...totals,
    status: existingQuote?.status || 'unpaid',
  };

  useEffect(() => {
    if (sameAsClient) {
      setForm(f => ({ ...f, project_address: f.client_address, project_city: f.client_city }));
    }
  }, [sameAsClient, form.client_address, form.client_city]);

  function updateField(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    setForm(f => {
      const items = [...f.line_items];
      items[index] = { ...items[index], [field]: field === 'amount' ? Number(value) : value };
      return { ...f, line_items: items };
    });
  }

  function addLineItem() {
    setForm(f => ({ ...f, line_items: [...f.line_items, { description: '', amount: 0 }] }));
  }

  function removeLineItem(index: number) {
    setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    if (!form.client_name.trim()) { showToast('Client name is required', 'error'); return; }
    if (form.line_items.length === 0) { showToast('Add at least one line item', 'error'); return; }

    setSaving(true);
    try {
      const url = mode === 'edit' && existingQuote ? `/api/quotes/${existingQuote.id}` : '/api/quotes';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      const saved = await res.json();
      showToast(mode === 'edit' ? 'Quote updated!' : `Quote ${saved.quote_number} created!`);
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c2974a] focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1c1a17] text-white py-4 px-6 flex items-center justify-between shadow-lg no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">← Dashboard</button>
          <h1 className="text-lg font-semibold">{mode === 'edit' ? `Edit ${form.quote_number}` : 'New Quotation'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">
            <Download className="w-4 h-4" />Print / PDF
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#c2974a] hover:bg-[#a67c30] disabled:bg-gray-400 text-white rounded-xl text-sm font-semibold transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Saving...' : mode === 'edit' ? 'Update Quote' : 'Save Quote'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left — Form */}
        <div className="space-y-5 no-print">
          {/* Quote details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6ddcf]">
            <h2 className="text-base font-bold text-[#1c1a17] mb-4">Quote Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Quote Number</label>
                <input className={inputCls} value={form.quote_number} onChange={e => updateField('quote_number', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" className={inputCls} value={form.quote_date} onChange={e => updateField('quote_date', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6ddcf]">
            <h2 className="text-base font-bold text-[#1c1a17] mb-4">Client Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Client Name *</label>
                  <input className={inputCls} placeholder="Jane Smith" value={form.client_name} onChange={e => updateField('client_name', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" className={inputCls} placeholder="jane@email.com" value={form.client_email} onChange={e => updateField('client_email', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Address</label>
                  <input className={inputCls} placeholder="123 Main St" value={form.client_address} onChange={e => updateField('client_address', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} placeholder="Mississauga" value={form.client_city} onChange={e => updateField('client_city', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Project address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6ddcf]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1c1a17]">Project Address</h2>
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input type="checkbox" checked={sameAsClient} onChange={e => setSameAsClient(e.target.checked)} className="rounded" />
                Same as client
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Address</label>
                <input className={inputCls} placeholder="123 Main St" value={form.project_address} disabled={sameAsClient} onChange={e => updateField('project_address', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="Mississauga" value={form.project_city} disabled={sameAsClient} onChange={e => updateField('project_city', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6ddcf]">
            <h2 className="text-base font-bold text-[#1c1a17] mb-4">Line Items</h2>
            <div className="space-y-3">
              {form.line_items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input className={inputCls} placeholder="Description of work..." value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)} />
                  </div>
                  <div className="w-32">
                    <input type="number" className={inputCls} placeholder="0.00" value={item.amount || ''} onChange={e => updateLineItem(i, 'amount', e.target.value)} />
                  </div>
                  <button onClick={() => removeLineItem(i)} disabled={form.line_items.length === 1} className="p-2.5 text-gray-300 hover:text-red-400 disabled:opacity-30 transition-colors mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addLineItem} className="mt-4 flex items-center gap-2 text-sm text-[#c2974a] hover:text-[#a67c30] font-medium transition-colors">
              <Plus className="w-4 h-4" />Add Line Item
            </button>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              {[['Subtotal', totals.subtotal], ['HST (13%)', totals.hst]].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-[#1c1a17]">${Number(v).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-[#1c1a17]">Total</span>
                <span className="font-black text-[#1c1a17] text-lg">${totals.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-[#a67c30] text-right">Commission (15%): ${totals.commission_10.toFixed(2)}</div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e6ddcf]">
            <h2 className="text-base font-bold text-[#1c1a17] mb-4">Notes</h2>
            <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Any additional notes for the client..." value={form.notes} onChange={e => updateField('notes', e.target.value)} />
          </div>
        </div>

        {/* Right — Preview */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e6ddcf] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#e6ddcf] bg-[#fdf8f0] no-print">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Preview</span>
            </div>
            <div className="p-1">
              <QuotePreview quote={previewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
