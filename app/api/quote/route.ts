// app/api/quote/route.ts
import { supabaseAdmin } from '../../lib/supabaseAdmin';

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

if (error || !data) {
  const msg =
    (error && typeof error === 'object' && 'message' in (error as Record<string, unknown>))
      ? String((error as { message?: unknown }).message)
      : 'not found';
  return Response.json({ error: msg }, { status: 404 });
}
// 타입 선언으로 any 제거
type BuyerJSON = { company?: string; name?: string; email?: string; phone?: string } | null | undefined;
type QuoteRow = typeof data & { buyer?: BuyerJSON };

const d = data as QuoteRow;
const b = d.buyer ?? {};

return Response.json({
  ...d,
  buyer_company: b?.company ?? '',
  buyer_name:    b?.name ?? '',
  buyer_email:   b?.email ?? '',
  buyer_phone:   b?.phone ?? '',
});

}
