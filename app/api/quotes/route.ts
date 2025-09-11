// app/api/quotes/route.ts
import { supabaseAdmin } from '../../lib/supabaseAdmin';

type Buyer = { company: string; name: string; email: string; phone?: string };
type Item  = { bundleId: string; name: string; qty: number };

function unitInc(bundleId: string): number {
  if (bundleId === 'event-premium') return 29000;
  if (bundleId === 'welcome-light') return 19000;
  return 15000; // basic-set
}

function safeMessage(e: unknown, fallback = '오류'): string {
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === 'object' && e && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string' && m.length > 0) return m;
    if (m != null) return String(m);
  }
  return fallback;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      buyer: Buyer;
      items: Item[];
      promoCode?: string;
    };

    const { buyer, items, promoCode } = body;

    // 1) 유효성
    if (!buyer?.company || !buyer?.name || !buyer?.email) {
      return Response.json({ error: '회사/담당자/이메일은 필수입니다.' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: '상품이 없습니다.' }, { status: 400 });
    }

    // 2) 소계(부가세 포함) 계산
    const subtotal_inc = items.reduce(
      (sum, it) => sum + unitInc(it.bundleId) * Math.max(1, it.qty),
      0
    );

    // 3) 프로모션 코드 → 할인 계산 (임시 룰)
    let discount_label = '';
    let discount_percent = 0; // %
    let discount_amount = 0;  // 원

    if (promoCode) {
      const code = promoCode.trim().toUpperCase();
      if (code === 'KOMU-2025') {
        discount_label = '커뮤니티 할인 (KOMU-2025)';
        discount_percent = 10;
      } else if (code === 'LAUNCH-5K') {
        discount_label = '런치 프로모션';
        discount_amount = 5000;
      } else {
        discount_label = `코드 미인증 (${code})`;
      }
    }

    // 4) 정액 → 정률 순서 적용
    const afterFlat  = Math.max(0, subtotal_inc - discount_amount);
    const percentOff = Math.floor(afterFlat * (discount_percent / 100));
    discount_amount  = Math.min(subtotal_inc, discount_amount + percentOff);

    // 5) 최종 금액(VAT 포함 기준)
    const net_inc   = Math.max(0, subtotal_inc - discount_amount);
    const vat       = net_inc - Math.round(net_inc / 1.1);
    const total_inc = net_inc;

    // 6) 저장
    const magic = crypto.randomUUID();

    const { data: row, error } = await supabaseAdmin
      .from('quotes')
      .insert([{
        buyer, items,
        subtotal_inc,
        discount_label, discount_percent, discount_amount,
        net_inc, vat, total_inc,
        status: 'draft' as const,
        magic_token: magic,
        // applied_promo_code: promoCode ?? null,  // 원하면 컬럼 추가 후 주석 해제
      }])
      .select('id')
      .single();

    if (error || !row?.id) {
      return Response.json({ error: safeMessage(error, '견적 저장 실패') }, { status: 500 });
    }

    const quoteLink = `/quote?q=${encodeURIComponent(row.id)}&k=${encodeURIComponent(magic)}`;
    return Response.json({ quoteId: row.id, quoteLink });
  } catch (e) {
    return Response.json({ error: safeMessage(e, 'unknown') }, { status: 500 });
  }
}
