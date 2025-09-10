import { supabaseAdmin } from '../../_lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { orderId, filename, mime } = await request.json();

    if (!orderId || !filename) {
      return new Response(JSON.stringify({ error: 'orderId, filename 필요' }), { status: 400 });
    }

    // logos/{orderId}/파일명 으로 저장
    const path = `logos/${orderId}/${filename}`;

    const { data, error } = await supabaseAdmin
      .storage
      .from('logos')
      .createSignedUploadUrl(path, { contentType: mime ?? 'application/octet-stream' });

    if (error || !data?.signedUrl) {
      return new Response(JSON.stringify({ error: error?.message || 'sign 실패' }), { status: 500 });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl, path }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
