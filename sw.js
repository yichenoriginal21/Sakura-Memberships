const CACHE_NAME = 'sakura-membership-v2';
const assetsToCache = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&family=Noto+Serif+JP:wght@700;900&family=Cinzel:wght@700&display=swap'
];

// ১. ইনস্টল করার সময় কোর অ্যাসেটগুলো ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(assetsToCache);
    }).then(() => self.skipWaiting())
  );
});

// ২. অ্যাক্টিভেশনের সময় পুরনো ক্যাশ ডিলিট করে ক্লিন করা
self.addEventListener('activate', (event) => {
  event.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });
});

// ৩. ফেচ রিকোয়েস্ট হ্যান্ডেল করা (ক্যাশ ফার্স্ট এবং ডাইনামিক রানটাইম ক্যাশিং)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // যদি রেসপন্স ভ্যালিড হয়, তবে রানটাইমে সেটি ক্যাশে সেভ করে রাখা (যেমন ফন্ট ফাইল বা ইমেজ)
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // অফলাইন ফলব্যাক বা হ্যান্ডলিং এখানে করা যেতে পারে
      });
    })
  );
});