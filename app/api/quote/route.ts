// app/api/quote/route.ts
import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const k = searchParams.get('k') || '';

  if (!q || !k) return Response.json({ error: 'missing q/k' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('quotes')
    .select('*')
    .eq('id', q)
    .eq('magic_token', k)
    .single();

  if (error || !data) return Response.json({ error: 'not found' }, { status: 404 });

  // buyer JSON을 화면에서 쓰기 쉬운 납작한 형태로도 같이 전달
  const buyer = (data as any).buyer || {};
  return Response.json({
    ...data,
    buyer_company: buyer.company ?? '',
    buyer_name: buyer.name ?? '',
    buyer_email: buyer.email ?? '',
    buyer_phone: buyer.phone ?? '',
  });
}
