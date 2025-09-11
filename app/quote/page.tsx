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

export default async function QuotePage({
  // Next.js 15 템플릿은 searchParams를 Promise로 전달합니다.
  searchParams,
}: {
  searchParams: Promise<{ q?: string; k?: string }>;
}) {
  // 반드시 await 해서 실제 값을 꺼냅니다.
  const sp = await searchParams;
  const q = sp?.q || '';
  const k = sp?.k || '';

  // 배포 환경에서 절대경로 생성 (상대 경로 fetch 이슈 회피)
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const base = host ? `${proto}://${host}` : '';

  const res = await fetch(`${base}/api/quote?q=${encodeURIComponent(q)}&k=${encodeURIComponent(k)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return <main className="p-6">견적을 찾을 수 없습니다.</main>;
  }

  const quote = (await res.json()) as Quote;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">견적서</h1>

      <section className="border rounded p-4">
        <div className="font-semibold">수신처</div>
        <div>{quote.buyer_company}</div>
        <div>
          {quote.buyer_name} · {quote.buyer_email}
        </div>
        {quote.buyer_phone && <div>{quote.buyer_phone}</div>}
      </section>

      <section className="border rounded p-4">
        <div className="font-semibold mb-2">금액</div>
        <div>소계(부가세포함): {quote.subtotal_inc.toLocaleString()}원</div>
        {quote.discount_amount > 0 && (
          <div>
            할인
            {quote.discount_label
              ? ` (${quote.discount_label}${quote.discount_percent ? ` ${quote.discount_percent}%` : ''})`
              : ''}{' '}
            : -{quote.discount_amount.toLocaleString()}원
          </div>
        )}
        <div>부가세(표시): {quote.vat.toLocaleString()}원</div>
        <div className="font-bold">총 합계: {quote.total_inc.toLocaleString()}원</div>
      </section>

      {/* (다음 단계) PDF 다운로드 / 주문확정 버튼 추가 예정 */}
      <div className="text-sm text-gray-500">PDF/결제 버튼은 다음 단계에서 붙입니다.</div>
    </main>
  );
}
