if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,c)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const t={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return t;default:return e(s)}})).then(e=>{const s=c(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-8a532145"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"4b9e431bbe6302e500b97b72baaaa2a2"},{url:"/static/css/2.c72968ad.chunk.css",revision:"25350fb6291c810389cc28968eb2d8c9"},{url:"/static/css/main.6e9c79cd.chunk.css",revision:"234798d4ba5568d03ce12e4f79965663"},{url:"/static/js/2.77cdf666.chunk.js",revision:"c3318e857d67461d0839bc4447c67ec4"},{url:"/static/js/2.77cdf666.chunk.js.LICENSE.txt",revision:"81896c98bac7b5b16ab1d3790da5b937"},{url:"/static/js/main.7c7a7039.chunk.js",revision:"b238129dd2c35e8283fa0fb433302e35"},{url:"/static/js/runtime~main.b51d5ea1.js",revision:"da9d1df3455e2da42129407df4b2a517"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
