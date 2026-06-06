'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, UserProfile } from '@/types/quote';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Plus, Search, Download, CheckCircle, Trash2, Eye,
  LogOut, FileText, DollarSign, TrendingUp, Clock,
} from 'lucide-react';

interface Props { quotes: Quote[]; userProfile: UserProfile; }
interface Toast { message: string; type: 'success' | 'error'; }

export default function DashboardClient({ quotes: initial, userProfile }: Props) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(initial);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [toast, setToast] = useState<Toast | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = userProfile.role === 'admin';

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = useMemo(() => {
    const r = quotes.filter(q => {
      if (!search) return true;
      const s = search.toLowerCase();
      return q.client_name?.toLowerCase().includes(s) || q.quote_number?.toLowerCase().includes(s) || q.client_city?.toLowerCase().includes(s);
    });
    return [...r].sort((a, b) => {
      if (sortBy === 'amount') return b.total - a.total;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [quotes, search, sortBy]);

  const stats = useMemo(() => {
    const total = quotes.reduce((s, q) => s + q.total, 0);
    const paid = quotes.filter(q => q.status === 'paid').reduce((s, q) => s + q.total, 0);
    const outstanding = quotes.filter(q => q.status !== 'paid').reduce((s, q) => s + q.total, 0);
    const paidSubtotal = quotes.filter(q => q.status === 'paid').reduce((s, q) => s + q.subtotal, 0);
    return { total, paid, outstanding, commission: paidSubtotal * 0.15 };
  }, [quotes]);

  const commissionData = useMemo(() => {
    const paid = quotes.filter(q => q.status === 'paid');
    const paidSub = paid.reduce((s, q) => s + q.subtotal, 0);
    const now = new Date();
    const monthly = paid.filter(q => {
      const d = new Date(q.paid_at || q.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlySub = monthly.reduce((s, q) => s + q.subtotal, 0);
    return { paidSub, commission: paidSub * 0.15, allTime: paid.length, monthlyDeals: monthly.length, monthlySub, monthlyCommission: monthlySub * 0.15 };
  }, [quotes]);

  async function markPaid(q: Quote) {
    setActionLoading(`paid-${q.id}`);
    try {
      const res = await fetch(`/api/quotes/${q.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paid', paid_at: new Date().toISOString() }) });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setQuotes(prev => prev.map(x => x.id === updated.id ? updated : x));
      showToast(`${q.quote_number} marked as paid — Receipt issued!`);
    } catch { showToast('Failed to update', 'error'); }
    finally { setActionLoading(null); }
  }

  async function deleteQuote(q: Quote) {
    if (!confirm(`Delete ${q.quote_number}? This cannot be undone.`)) return;
    setActionLoading(`delete-${q.id}`);
    try {
      const res = await fetch(`/api/quotes/${q.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setQuotes(prev => prev.filter(x => x.id !== q.id));
      showToast(`${q.quote_number} deleted`);
    } catch { showToast('Failed to delete', 'error'); }
    finally { setActionLoading(null); }
  }

  async function handleLogout() {
    const { createBrowserClient } = await import('@supabase/ssr');
    const sb = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    await sb.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-700 border border-green-200',
      unpaid: 'bg-amber-100 text-amber-700 border border-amber-200',
    };
    const label = status === 'paid' ? 'Receipt' : 'Quotation';
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || map.unpaid}`}>{label}</span>;
  }

  const monthName = new Date().toLocaleString('en-CA', { month: 'long' });

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium toast-enter flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1c1a17] text-white py-4 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[#c2974a] font-semibold text-lg leading-none tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              My<em className="italic">Kitchen</em>Upgrade<span className="text-xs align-super">.CA</span>
            </div>
            <div className="text-[#a59c8d] text-[9px] uppercase tracking-widest mt-0.5">Quote Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium">{userProfile.name || userProfile.email}</div>
            <div className="text-xs text-gray-400 capitalize">{userProfile.role}</div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: <FileText className="w-3.5 h-3.5 text-[#c2974a]" />, bg: 'bg-[#c2974a]/10', label: 'Total Quoted', value: formatCurrency(stats.total), sub: `${quotes.length} quotation${quotes.length !== 1 ? 's' : ''}`, color: 'text-[#1c1a17]' },
            { icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />, bg: 'bg-green-50', label: 'Total Paid', value: formatCurrency(stats.paid), sub: `${quotes.filter(q => q.status === 'paid').length} paid`, color: 'text-green-600' },
            { icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, bg: 'bg-amber-50', label: 'Outstanding', value: formatCurrency(stats.outstanding), sub: `${quotes.filter(q => q.status !== 'paid').length} pending`, color: 'text-amber-600' },
            { icon: <TrendingUp className="w-3.5 h-3.5 text-[#c2974a]" />, bg: 'bg-[#c2974a]/10', label: 'Commission (15%)', value: formatCurrency(stats.commission), sub: 'of paid subtotals', color: 'text-[#a67c30]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6ddcf]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${s.bg} p-1.5 rounded-lg shrink-0`}>{s.icon}</div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{s.label}</span>
              </div>
              <div className={`text-lg sm:text-xl font-black leading-tight ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-400 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e6ddcf] overflow-hidden">
          <div className="p-5 border-b border-[#e6ddcf] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#1c1a17]">Quotations</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or quote #..."
                  className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#c2974a] focus:border-transparent" />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c2974a] bg-white">
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
                <option value="status">Sort: Status</option>
              </select>
              <button onClick={() => router.push('/quote/new')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1a17] text-white rounded-xl text-sm font-semibold hover:bg-[#2d2924] transition-all whitespace-nowrap">
                <Plus className="w-4 h-4" />New Quotation
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Quote #', 'Date', 'Client', 'City', 'Total', 'Status', 'Commission', 'Actions'].map((h, i) => (
                    <th key={h} className={`text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 3 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'hidden lg:table-cell text-right' : ''} ${i === 4 ? 'text-right' : ''} ${i === 7 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p className="text-gray-400 text-sm">{search ? 'No quotations match your search' : 'No quotations yet'}</p>
                      {!search && <button onClick={() => router.push('/quote/new')} className="text-[#c2974a] text-sm font-medium hover:underline">Create your first quotation</button>}
                    </div>
                  </td></tr>
                ) : filtered.map(q => (
                  <tr key={q.id} className="hover:bg-[#fdf9f4] transition-colors">
                    <td className="py-3.5 px-4"><span className="text-sm font-semibold text-[#a67c30]">{q.quote_number}</span></td>
                    <td className="py-3.5 px-4"><span className="text-sm text-gray-600">{formatDate(q.quote_date)}</span></td>
                    <td className="py-3.5 px-4"><span className="text-sm font-medium text-[#1c1a17]">{q.client_name}</span></td>
                    <td className="py-3.5 px-4 hidden md:table-cell"><span className="text-sm text-gray-500">{q.client_city || '—'}</span></td>
                    <td className="py-3.5 px-4 text-right"><span className="text-sm font-semibold text-[#1c1a17]">{formatCurrency(q.total)}</span></td>
                    <td className="py-3.5 px-4 text-center">{statusBadge(q.status)}</td>
                    <td className="py-3.5 px-4 text-right hidden lg:table-cell"><span className="text-sm text-[#a67c30] font-medium">{formatCurrency(q.subtotal * 0.15)}</span></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => router.push(`/quote/${q.id}`)} title="View" className="p-1.5 text-gray-400 hover:text-[#c2974a] rounded-lg hover:bg-[#c2974a]/10 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => router.push(`/quote/${q.id}?download=true`)} title="Download PDF" className="p-1.5 text-gray-400 hover:text-[#c2974a] rounded-lg hover:bg-[#c2974a]/10 transition-colors"><Download className="w-4 h-4" /></button>
                        {q.status !== 'paid' && (
                          <button onClick={() => markPaid(q)} disabled={actionLoading === `paid-${q.id}`} title="Mark as Paid" className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"><CheckCircle className="w-4 h-4" /></button>
                        )}
                        {isAdmin && (
                          <button onClick={() => deleteQuote(q)} disabled={actionLoading === `delete-${q.id}`} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {quotes.length} quotation{quotes.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Commission Panel — Admin only */}
        {isAdmin && (
          <div className="bg-[#1c1a17] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#c2974a]/20 p-2 rounded-lg"><DollarSign className="w-5 h-5 text-[#c2974a]" /></div>
              <div>
                <h2 className="text-lg font-bold">Commission Summary</h2>
                <p className="text-xs text-gray-400 mt-0.5">15% flat rate on all paid subtotals</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* All-time */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">All-Time Paid</div>
                {[['Deals Closed', String(commissionData.allTime), 'text-white'], ['Paid Subtotal', formatCurrency(commissionData.paidSub), 'text-white'], ['Commission (15%)', formatCurrency(commissionData.commission), 'text-[#c2974a]']].map(([l, v, c]) => (
                  <div key={l} className="flex justify-between mb-2"><span className="text-sm text-gray-300">{l}</span><span className={`text-sm font-semibold ${c}`}>{v}</span></div>
                ))}
              </div>
              {/* This month */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{monthName}</div>
                {[['Deals Closed', String(commissionData.monthlyDeals), 'text-white'], ['Subtotal', formatCurrency(commissionData.monthlySub), 'text-white'], ['Commission (15%)', formatCurrency(commissionData.monthlyCommission), 'text-[#c2974a]']].map(([l, v, c]) => (
                  <div key={l} className="flex justify-between mb-2"><span className="text-sm text-gray-300">{l}</span><span className={`text-sm font-semibold ${c}`}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
