if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,t)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const c={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return c;default:return e(s)}})).then(e=>{const s=t(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-8a532145"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"ce521a91d42154da559a2e211718ef03"},{url:"/static/css/2.77cf4ef6.chunk.css",revision:"e0af652145a58b0a822e20811a164627"},{url:"/static/css/main.9008253a.chunk.css",revision:"06a7ab46a3b0a82e0558963bd2e0b069"},{url:"/static/js/2.08ed5f2b.chunk.js",revision:"c3b6684e068f593a45f6bd8309855843"},{url:"/static/js/2.08ed5f2b.chunk.js.LICENSE.txt",revision:"fe07165234709e61e0cdc05d4056de5c"},{url:"/static/js/main.4b657596.chunk.js",revision:"a05c02cf4223c1575c9c24c5ab117f2e"},{url:"/static/js/runtime~main.58b3340a.js",revision:"345cb4a616673409d684e01d556e3876"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
