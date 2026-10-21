const CACHE='wf-launcher-v0.6.0';
const SHELL=['./launcher.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Network-first (bypassing the browser's HTTP cache) so new versions show on the next open; cache is the offline fallback.
// Same-origin GETs only. GitHub API calls are never touched.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    try{
      const r=await Promise.race([fetch(u.href,{cache:'no-cache'}),new Promise((_,j)=>setTimeout(j,4000))]);
      if(r.ok)c.put(e.request,r.clone());
      return r;
    }catch(err){
      return (await c.match(e.request,{ignoreSearch:true}))||Response.error();
    }
  })());
});
