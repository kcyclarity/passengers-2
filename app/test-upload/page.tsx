'use client';

import { useState } from 'react';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [log, setLog] = useState<string>('');

  async function handleUpload() {
    try {
      if (!file) { setLog('파일을 선택하세요'); return; }

      setLog('서명 URL 요청 중...');
      const orderId = crypto.randomUUID(); // 테스트용 가짜 주문번호

      const res = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, filename: file.name, mime: file.type }),
      });

      const j = await res.json();
      if (!res.ok) { setLog('sign 실패: ' + (j?.error ?? '')); return; }

      setLog('업로드 중...');
      const put = await fetch(j.signedUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file
      });
      if (!put.ok) { setLog('업로드 실패'); return; }

      setLog(`완료! 저장 경로: ${j.path}\nSupabase → Storage → logos 버킷에서 확인하세요.`);
    } catch (e: any) {
      setLog('에러: ' + (e?.message || 'unknown'));
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">로고 업로드 테스트</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="mt-3 px-3 py-2 rounded bg-black text-white">
        업로드
      </button>
      <pre className="mt-4 whitespace-pre-wrap text-sm">{log}</pre>
      <p className="text-xs text-gray-500 mt-2">업로드되면 Supabase 콘솔 → Storage → logos 에서 확인.</p>
    </main>
  );
}
