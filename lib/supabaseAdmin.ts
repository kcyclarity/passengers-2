// app/_lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 배포 시 환경변수 빠지면 바로 알려주기
if (!url || !serviceKey) {
  throw new Error('Missing Supabase env: URL or SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
