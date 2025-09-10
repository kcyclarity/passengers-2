import { supabaseAdmin } from '../_lib/supabaseAdmin';

type Buyer = { company: string; name: string; email: string; phone?: string };
type Item = { bundleId: string; name: string; qty: number };

function priceOf(bundleId: string): number {
  // 임시 단가 표 — 나중에 관리자페이지/DB 연동으로 바꿔도 됨
  if (bundleId === 'event-premium') return 29000;
  if (bundleId === 'welcome-light') return 19000;
  return 15000; // basic-set
}

export async function POST(request: Request) {
  try {
    const { buyer, items, notes, promoCode } = (await request.json()) as {
      buyer: Buyer;
      items: Item[];
      notes?: string;
      promoCode?: string;
    };

    if (!buyer?.company || !buyer?.name || !buyer?.email || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: '필수 항목 누락' }), { status: 400 });
    }

    // 금액 계산 (아주 단순한 버전)
    const subtotal = items.reduce((sum, it) => sum + priceOf(it.bundleId) * Math.max(1, it.qty), 0);
    const discount = 0; // TODO: promoCode 적용 로직은 이후 단계에서
    const vat = Math.round((subtotal - discount) * 0.1);
    const total = subtotal - discount + vat;

    // 매직링크 토큰 (주문 추적용)
    const magic = crypto.randomUUID();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          status: 'awaiting_payment',
          buyer,
          shipping: null,
          items,
          subtotal,
          discount,
          vat,
          total,
          promo_id: null, // 추후 promoCode 검증 후 연결
          need_tax_invoice: false,
          change_deadline_at: null,
          magic_token: magic,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (error || !data?.id) {
      return new Response(JSON.stringify({ error: error?.message || '주문 저장 실패' }), { status: 500 });
    }

    const orderId = data.id as string;
    const magicLink = `/track?o=${encodeURIComponent(orderId)}&k=${encodeURIComponent(magic)}`;

    return new Response(JSON.stringify({ orderId, magicLink }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
