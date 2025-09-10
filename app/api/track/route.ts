import { supabaseAdmin } from '../_lib/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('o');
  const magic = searchParams.get('k');

  if (!orderId || !magic) {
    return new Response(JSON.stringify({ error: '잘못된 요청' }), { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, buyer, items, subtotal, discount, vat, total, created_at')
    .eq('id', orderId)
    .eq('magic_token', magic)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: '주문을 찾을 수 없습니다.' }), { status: 404 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}
