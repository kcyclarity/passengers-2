// app/order/page.tsx
'use client';

import { useState } from 'react';

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';

export default function OrderPage() {
  const [state, setState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // 폼에서 읽기
    const company = String(fd.get('company') || '');
    const name = String(fd.get('name') || '');
    const email = String(fd.get('email') || '');
    const phone = String(fd.get('phone') || '');
    const notes = String(fd.get('notes') || '');
    const promoCode = String(fd.get('promo') || '');   // ← 입력칸 name="promo"

    const bundleId = String(fd.get('bundle') || 'basic-set');
    const qty = Number(fd.get('qty') || 10);

    if (!company || !name || !email) {
      setState('error');
      setMessage('회사명/담당자/이메일은 필수입니다.');
      return;
    }

    setState('submitting');
    setMessage('');

    // API에 보낼 페이로드 (camelCase)
    const body = {
      buyer: { company, name, email, phone },
      items: [{ bundleId, name: bundleId, qty }],
      notes,                 // ← 메모 (그대로)
      promoCode,             // ← 프로모션 코드 (API가 promo_code로 매핑)
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      const j = await res.json();

      if (!res.ok) {
        setState('error');
        setMessage(j?.error || '주문 생성에 실패했습니다.');
        return;
      }

      setState('done');
      setMessage(`주문이 접수되었습니다. 추적 링크: ${j.magicLink}`);

      // 자동 이동을 원하면 아래 주석 해제
      // window.location.href = j.magicLink;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      setState('error');
      setMessage('네트워크 오류: ' + msg);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">주문/견적 요청</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* 세트 선택 */}
        <div>
          <label className="block text-sm font-medium mb-1">세트 선택</label>
          <select name="bundle" className="border rounded px-3 py-2 w-full">
            <option value="basic-set">스탭 기본 세트</option>
            <option value="event-premium">행사 프리미엄</option>
            <option value="welcome-light">웰컴키트 라이트</option>
          </select>
        </div>

        {/* 수량 */}
        <div>
          <label className="block text-sm font-medium mb-1">수량</label>
          <input name="qty" type="number" min={1} defaultValue={10} className="border rounded px-3 py-2 w-full" />
        </div>

        {/* 구매자 정보 */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">회사명*</label>
            <input name="company" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">담당자명*</label>
            <input name="name" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일*</label>
            <input name="email" type="email" className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input name="phone" className="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium mb-1">요청사항</label>
          <textarea name="notes" rows={4} className="border rounded px-3 py-2 w-full" />
        </div>

        {/* 프로모션 코드 */}
        <div>
          <label className="block text-sm font-medium mb-1">프로모션 코드 (선택)</label>
          <input name="promo" placeholder="예: KOMU-2025" className="border rounded px-3 py-2 w-full" />
        </div>

        <button
          disabled={state === 'submitting'}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        >
          {state === 'submitting' ? '처리 중…' : '견적 생성하기'}
        </button>

        {message && (
          <p className={`text-sm mt-2 ${state === 'error' ? 'text-red-600' : 'text-green-700'}`}>
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
