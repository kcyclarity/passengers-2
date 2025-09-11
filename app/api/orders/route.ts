// app/api/orders/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'invalid_json' }, { status: 400 });

    // 프런트에서 넘어오는 값
    const { buyer, items, notes, promoCode } = body ?? {};

    // 필수값 체크
    if (!buyer?.company || !buyer?.name || !buyer?.email) {
      return Response.json({ error: 'missing_required_buyer_fields' }, { status: 400 });
    }

    // items는 없을 수도 있으니 안전하게
    const safeItems = Array.isArray(items) ? items : [];

    // DB에 저장 (snake_case 컬럼명 사용)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        buyer,                 // jsonb
        items: safeItems,      // jsonb
        notes: notes ?? null,  // text (nullable)
        promo_code: promoCode ?? null, // text (nullable)
        // subtotal/discount/vat/total/status, created_at은 DB default 사용
      })
      .select('id, magic_token')
      .single();

    if (error) {
      console.error('/api/orders insert error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const magicLink = `/quote?q=${data.id}&k=${data.magic_token}`;
    return Response.json({ ok: true, id: data.id, magicLink });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('/api/orders unhandled error:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
