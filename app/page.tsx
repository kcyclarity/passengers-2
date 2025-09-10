export default function Home() {
  const menus = [
    { key: 'staff-gift', label: '직원선물' },
    { key: 'event-memento', label: '행사기념품' },
    { key: 'welcome-kit', label: '웰컴키트' },
    { key: 'conference', label: '컨퍼런스 굿즈' },
  ];

  const cards = [
    { id: 'basic-set', title: '스탭 기본 세트', desc: '텀블러 + 스티커 + 파우치' },
    { id: 'event-premium', title: '행사 프리미엄', desc: '티셔츠 + 텀블러 + 노트' },
    { id: 'welcome-light', title: '웰컴키트 라이트', desc: '머그 + 펜 + 노트' },
  ];

  return (
    <main className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* 좌측 고정 메뉴(노션 느낌) */}
      <aside className="h-screen sticky top-0 border-r p-4">
        <h2 className="font-bold mb-3">카테고리</h2>
        <nav className="space-y-2">
          {menus.map(m => (
            <a key={m.key} href={`/?cat=${m.key}`} className="block hover:underline">
              {m.label}
            </a>
          ))}
        </nav>
        <div className="mt-6 text-sm text-gray-500">
          <a href="/order" className="underline">바로 견적/주문하기 →</a>
        </div>
      </aside>

      {/* 메인: 카드 리스트 */}
      <section className="p-6">
        <h1 className="text-2xl font-bold mb-4">추천 굿즈 세트</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
              <a href={`/order?bundle=${c.id}`} className="inline-block mt-3 text-sm underline">
                상세/견적 받기
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
