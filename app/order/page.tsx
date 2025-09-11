// app/order/page.tsx  (필요시 전체 교체)
'use client';
import { useState } from 'react';

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

export default function OrderPage() {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const buyer = {
      company: String(fd.get('company') || ''),
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      phone: String(fd.get('phone') || ''),
    };
    const bundleId = String(fd.get('bundle') || 'basic-set');
    const qty = Number(fd.get('qty') || 10);

    if (!buyer.company || !buyer.name || !buyer.email) {
      setState('error'); setMessage('회사/담당자/이메일은 필수입니다.'); return;
    }

    setState('submitting'); setMessage('');
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          buyer,
          items: [{ bundleId, name: bundleId, qty }],
        }),
      });
      const j = await res.json();
      if (!res.ok) { setState('error'); setMessage(j?.error || '오류'); return; }

      // ✅ 견적 페이지로 이동
      window.location.href = j.quoteLink;
} catch {
  setState('error'); setMessage('네트워크 오류');
}

  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">주문/견적 요청</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">세트</label>
          <select name="bundle" className="border rounded px-3 py-2 w-full">
            <option value="basic-set">스탭 기본 세트</option>
            <option value="event-premium">행사 프리미엄</option>
            <option value="welcome-light">웰컴키트 라이트</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">수량</label>
          <input name="qty" type="number" min={1} defaultValue={10} className="border rounded px-3 py-2 w-full" />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="block text-sm mb-1">회사명*</label><input name="company" className="border rounded px-3 py-2 w-full" /></div>
          <div><label className="block text-sm mb-1">담당자명*</label><input name="name" className="border rounded px-3 py-2 w-full" /></div>
          <div><label className="block text-sm mb-1">이메일*</label><input name="email" type="email" className="border rounded px-3 py-2 w-full" /></div>
          <div><label className="block text-sm mb-1">연락처</label><input name="phone" className="border rounded px-3 py-2 w-full" /></div>
        </div>

        {/* (선택) 프로모션 코드 */}
<div>
  <label className="block text-sm mb-1">프로모션 코드 (선택)</label>
  <input
    name="promo"
    placeholder="예: KOMU-2025"
    className="border rounded px-3 py-2 w-full"
  />
  <p className="text-xs text-gray-500 mt-1">코드가 없으면 비워두세요.</p>
</div>


        <button disabled={state==='submitting'} className="px-4 py-2 rounded bg-black text-white">
          {state==='submitting' ? '처리 중…' : '견적 생성하기'}
        </button>
        {message && <p className={`text-sm mt-2 ${state==='error' ? 'text-red-600' : 'text-green-700'}`}>{message}</p>}
      </form>
    </main>
  );
}
