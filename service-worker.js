if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,i,n)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const t={uri:location.origin+s.slice(1)};return Promise.all(i.map((s=>{switch(s){case"exports":return r;case"module":return t;default:return e(s)}}))).then((e=>{const s=n(...e);return r.default||(r.default=s),r}))})))}}define("./service-worker.js",["./workbox-d9ace124"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"732c3f40f146d6da0173535096817be9"},{url:"/static/css/2.a36ba91f.chunk.css",revision:null},{url:"/static/css/main.1aeab01b.chunk.css",revision:null},{url:"/static/js/2.af81fb1e.chunk.js",revision:null},{url:"/static/js/2.af81fb1e.chunk.js.LICENSE.txt",revision:"81896c98bac7b5b16ab1d3790da5b937"},{url:"/static/js/main.02a16977.chunk.js",revision:null},{url:"/static/js/runtime~main.e3cfefeb.js",revision:null}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
