if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,c)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const t={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return t;default:return e(s)}})).then(e=>{const s=c(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-8a532145"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"aa84d3d22420889293cb232b4b47103c"},{url:"/static/css/2.c4381def.chunk.css",revision:"c32f6fa0bfb22b296a4b288d0fa10d12"},{url:"/static/css/main.5587f0f8.chunk.css",revision:"afcc70aeea45800c787364c8590c76c7"},{url:"/static/js/2.908e1bb1.chunk.js",revision:"dded500552b717dd505b10161db9300a"},{url:"/static/js/2.908e1bb1.chunk.js.LICENSE.txt",revision:"fe07165234709e61e0cdc05d4056de5c"},{url:"/static/js/main.d6cb8099.chunk.js",revision:"5099d05beaf5e991baac5c5247f21685"},{url:"/static/js/runtime~main.e1c301f3.js",revision:"0de74a7896ec9363020cd5976117a249"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
