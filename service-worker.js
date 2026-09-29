const CACHE='iron-coach-shell-v9';
const SHELL=['./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./favicon-32.png'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(event.request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        const c=await caches.open(CACHE);
        c.put('./index.html',fresh.clone()).catch(()=>{});
        return fresh;
      }catch(e){
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }
  if(url.origin===location.origin){
    event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{})}
      return res;
    })));
  }
});
