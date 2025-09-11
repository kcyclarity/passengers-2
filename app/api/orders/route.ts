import { NextRequest } from 'next/server';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'invalid_json' }, { status: 400 });

    const { buyer, items, notes, promoCode } = body ?? {};

    if (!buyer?.company || !buyer?.name || !buyer?.email) {
      return Response.json({ error: 'missing_required_buyer_fields' }, { status: 400 });
    }

    const safeItems = Array.isArray(items) ? items : [];

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert({
        buyer,                 // jsonb
        items: safeItems,      // jsonb
        notes: notes ?? null,  // text (nullable)
        promo_code: promoCode ?? null, // text (nullable)
        // subtotal/discount/vat/total 은 DB default 0 사용
        // status 는 default 'draft' (옵션)
      })
      .select('id, magic_token')
      .single();

    if (error) {
      console.error('Supabase insert error /api/orders:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const magicLink = `/quote?q=${data.id}&k=${data.magic_token}`;
    return Response.json({ ok: true, id: data.id, magicLink });
  } catch (e) {
    console.error('Unhandled /api/orders error:', e);
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 500 });
  }
}
