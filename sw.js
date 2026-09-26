/* 플립시계 오프라인 캐시. 파일을 고친 뒤에는 아래 버전 숫자를 하나 올리면 확실히 갱신됩니다. */
const CACHE = 'flipclock-v2';
const ASSETS = ['./', 'index.html', 'icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 저장본을 먼저 보여 주고, 뒤에서 최신본을 받아 다음 실행 때 반영 */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request)
          .then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
