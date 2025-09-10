const CACHE='todo-parallax-v3-2';
const ASSETS=['/TO-DO-LIST-PARALLAX/','/TO-DO-LIST-PARALLAX/index.html','/TO-DO-LIST-PARALLAX/manifest.webmanifest?v=3.2','/TO-DO-LIST-PARALLAX/icons/icon-192.png','/TO-DO-LIST-PARALLAX/icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url); if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>(res.ok&&caches.open(CACHE).then(c=>c.put(e.request,res.clone())),res)).catch(()=>u.pathname==='/'||e.request.mode==='navigate'?caches.match('/TO-DO-LIST-PARALLAX/index.html'):Promise.reject())))});
