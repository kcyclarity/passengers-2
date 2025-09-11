// app/api/quote/route.ts
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// 안전한 메시지 추출
function safeMessage(e: unknown, fallback = '오류') {
  if (e instanceof Error) return e.message || fallback;
  if (typeof e === 'object' && e && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string' && m.length > 0) return m;
    if (m != null) return String(m);
  }
  return fallback;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || ''; // quotes.id
    const k = searchParams.get('k') || ''; // quotes.magic_token

    if (!q || !k) {
      return Response.json({ error: 'missing q or k' }, { status: 400 });
    }

    // 필요한 필드들만 선택
    const { data, error } = await supabaseAdmin
      .from('quotes')
      .select(
        [
          'id',
          'buyer',             // JSON
          'items',             // JSON[]
          'subtotal_inc',
          'discount_label',
          'discount_percent',
          'discount_amount',
          'net_inc',
          'vat',
          'total_inc',
          'status',
          'magic_token',
        ].join(',')
      )
      .eq('id', q)
      .eq('magic_token', k)
      .limit(1)
      .single();

    if (error || !data) {
      return Response.json({ error: safeMessage(error, 'not found') }, { status: 404 });
    }

    // buyer JSON을 화면에서 쓰기 쉽게 펼침
    type BuyerJSON = { company?: string; name?: string; email?: string; phone?: string } | null | undefined;
    const buyer = (data.buyer as BuyerJSON) ?? {};

    return Response.json({
      id: data.id,
      // 화면에 필요한 필드
      buyer_company: buyer?.company ?? '',
      buyer_name:    buyer?.name ?? '',
      buyer_email:   buyer?.email ?? '',
      buyer_phone:   buyer?.phone ?? '',
      // 금액들
      subtotal_inc:     data.subtotal_inc ?? 0,
      discount_label:   data.discount_label ?? '',
      discount_percent: data.discount_percent ?? 0,
      discount_amount:  data.discount_amount ?? 0,
      vat:              data.vat ?? 0,
      total_inc:        data.total_inc ?? 0,
      // 필요 시 추가
      status:           data.status ?? 'draft',
      items:            data.items ?? [],
    });
  } catch (e) {
    return Response.json({ error: safeMessage(e, 'unknown') }, { status: 500 });
  }
}
