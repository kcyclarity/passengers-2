'use client';

import { useEffect, useState } from 'react';

type Order = {
  id: string;
  status: string;
  buyer: { company: string; name: string; email: string; phone?: string };
  items: { bundleId: string; name: string; qty: number }[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  created_at: string;
};

export default function TrackPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const o = params.get('o');
    const k = params.get('k');
    if (!o || !k) {
      setError('잘못된 접근입니다.');
      return;
    }

    fetch(`/api/track?o=${o}&k=${k}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError('주문 조회 중 오류가 발생했습니다.'));
  }, []);

  if (error) {
    return <main className="p-6 text-red-600">{error}</main>;
  }

  if (!order) {
    return <main className="p-6">조회 중...</main>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-2">주문 추적</h1>
      <p className="text-gray-600">주문번호: {order.id}</p>
      <p className="text-gray-600">현재 상태: <strong>{order.status}</strong></p>
      <p className="text-gray-600">주문일시: {new Date(order.created_at).toLocaleString()}</p>

      <h2 className="text-lg font-semibold mt-4">구성품</h2>
      <ul className="list-disc ml-6">
        {order.items.map((it, idx) => (
          <li key={idx}>
            {it.name} × {it.qty}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-4">결제 정보</h2>
      <p>소계: {order.subtotal.toLocaleString()}원</p>
      <p>할인: {order.discount.toLocaleString()}원</p>
      <p>부가세: {order.vat.toLocaleString()}원</p>
      <p className="font-bold">합계: {order.total.toLocaleString()}원</p>
    </main>
  );
}
