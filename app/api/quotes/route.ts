// app/api/quotes/route.ts
import { supabaseAdmin } from '../../lib/supabaseAdmin';

type Buyer = { company: string; name: string; email: string; phone?: string };
type Item  = { bundleId: string; name: string; qty: number };

// 세트별 단가(부가세 포함가, 임시값)
function unitInc(bundleId: string): number {
  if (bundleId === 'event-premium') return 29000;
  if (bundleId === 'welcome-light') return 19000;
  return 15000; // basic-set
}

export async function POST(req: Request) {
  try {
    const { buyer, items } = (await req.json()) as { buyer: Buyer; items: Item[] };

    if (!buyer?.company || !buyer?.name || !buyer?.email) {
      return Response.json({ error: '회사/담당자/이메일은 필수입니다.' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: '상품이 없습니다.' }, { status: 400 });
    }

    // 합계 계산 (확장 스키마 컬럼 사용)
    const subtotal_inc = items.reduce(
      (sum, it) => sum + unitInc(it.bundleId) * Math.max(1, it.qty),
      0
    );
    const discount_label = '';       // 지금은 빈값
    const discount_percent = 0;      // 지금은 0%
    const discount_amount = 0;       // 지금은 0원
    const net_inc = subtotal_inc - discount_amount;
    const vat = net_inc - Math.round(net_inc / 1.1); // 표시용 역산
    const total_inc = net_inc;
    const magic = crypto.randomUUID(); // 매직링크 토큰

    const { data, error } = await supabaseAdmin
      .from('quotes')
      .insert([{
        buyer,
        items,
        subtotal_inc,
        discount_label,
        discount_percent,
        discount_amount,
        net_inc,
        vat,
        total_inc,
        status: 'draft',
        magic_token: magic,
      }])
      .select('id')
      .single();

    if (error || !data?.id) {
      return Response.json({ error: error?.message || '견적 저장 실패' }, { status: 500 });
    }

    const quoteLink = `/quote?q=${encodeURIComponent(data.id)}&k=${encodeURIComponent(magic)}`;
    return Response.json({ quoteId: data.id, quoteLink });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return Response.json({ error: msg }, { status: 500 });
  }
}
