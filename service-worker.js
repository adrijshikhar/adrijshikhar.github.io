if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,i,c)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const t={uri:location.origin+s.slice(1)};return Promise.all(i.map(s=>{switch(s){case"exports":return r;case"module":return t;default:return e(s)}})).then(e=>{const s=c(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-8a532145"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"aefe68a75c1ee5c8e61d86bbe20c30de"},{url:"/static/css/2.5cfa816d.chunk.css",revision:"59e83db1a83e5c505fa8d91d51ccd077"},{url:"/static/css/main.ca9324a8.chunk.css",revision:"b248a8c2efb374b598b3ec1a30b213b8"},{url:"/static/js/2.3b195996.chunk.js",revision:"5435fd1d1b94e05ffb001f96a5235746"},{url:"/static/js/2.3b195996.chunk.js.LICENSE.txt",revision:"81896c98bac7b5b16ab1d3790da5b937"},{url:"/static/js/main.a7775d6d.chunk.js",revision:"02bbdc56a59871ee8eb77b369ee642d2"},{url:"/static/js/runtime~main.e3cfefeb.js",revision:"93b6af07ba0d9b345415ccd2485df099"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
