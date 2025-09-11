// app/quote/page.tsx
import { headers } from 'next/headers';

type Quote = {
  buyer_company: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  subtotal_inc: number;
  discount_label: string;
  discount_percent: number;
  discount_amount: number;
  vat: number;
  total_inc: number;
};

export default async function QuotePage({ searchParams }: { searchParams: { q?: string; k?: string } }) {
  const q = searchParams.q || '';
  const k = searchParams.k || '';

  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const base = host ? `${proto}://${host}` : '';

  const res = await fetch(`${base}/api/quote?q=${q}&k=${k}`, { cache: 'no-store' });
  if (!res.ok) return <main className="p-6">견적을 찾을 수 없습니다.</main>;

  const quote = (await res.json()) as Quote;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">견적서</h1>

      <section className="border rounded p-4">
        <div className="font-semibold">수신처</div>
        <div>{quote.buyer_company}</div>
        <div>{quote.buyer_name} · {quote.buyer_email}</div>
        {quote.buyer_phone && <div>{quote.buyer_phone}</div>}
      </section>

      <section className="border rounded p-4">
        <div className="font-semibold mb-2">금액</div>
        <div>소계(부가세포함): {quote.subtotal_inc.toLocaleString()}원</div>
        {quote.discount_amount > 0 && (
          <div>
            할인{quote.discount_label ? ` (${quote.discount_label}${quote.discount_percent ? ` ${quote.discount_percent}%` : ''})` : ''}: -{quote.discount_amount.toLocaleString()}원
          </div>
        )}
        <div>부가세(표시): {quote.vat.toLocaleString()}원</div>
        <div className="font-bold">총 합계: {quote.total_inc.toLocaleString()}원</div>
      </section>
    </main>
  );
}
