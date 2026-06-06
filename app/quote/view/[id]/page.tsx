import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import QuotePreview from '@/components/QuotePreview';

export default async function PublicViewPage({ params }: { params: { id: string } }) {
  const service = createServiceClient();
  const { data: quote } = await service.from('quotes_portal').select('*').eq('id', params.id).single();
  if (!quote) notFound();

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 no-print">
          <div>
            <h1 className="text-xl font-bold text-[#1c1a17]">Your Kitchen Quote</h1>
            <p className="text-sm text-gray-500 mt-1">From MyKitchenUpgrade.ca</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1c1a17] text-white rounded-xl text-sm font-medium hover:bg-[#2d2924] transition-colors"
          >
            Download PDF
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#e6ddcf] overflow-hidden">
          <QuotePreview quote={quote} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Call us at <a href="tel:+19055550199" className="text-[#c2974a]">(905) 555-0199</a>
        </p>
      </div>
    </div>
  );
}
