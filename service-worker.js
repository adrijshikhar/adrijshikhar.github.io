if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise(async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()})),s.then(()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]})},s=(s,r)=>{Promise.all(s.map(e)).then(e=>r(1===e.length?e[0]:e))},r={require:Promise.resolve(s)};self.define=(s,c,i)=>{r[s]||(r[s]=Promise.resolve().then(()=>{let r={};const t={uri:location.origin+s.slice(1)};return Promise.all(c.map(s=>{switch(s){case"exports":return r;case"module":return t;default:return e(s)}})).then(e=>{const s=i(...e);return r.default||(r.default=s),r})}))}}define("./service-worker.js",["./workbox-8a532145"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"2faad858360f7c1d79bceccd1bdde12e"},{url:"/static/css/2.af34670d.chunk.css",revision:"e6786f930fb134115cca95919ebc79cf"},{url:"/static/css/main.6859d74a.chunk.css",revision:"f501e71363155df85e0335e324b6d7d3"},{url:"/static/js/2.db730b0d.chunk.js",revision:"b094c91cfc1891e21640ddbf64eaa56d"},{url:"/static/js/2.db730b0d.chunk.js.LICENSE.txt",revision:"fe07165234709e61e0cdc05d4056de5c"},{url:"/static/js/main.5895e6bd.chunk.js",revision:"f3e39c976daac0b95f05d185b9646cf5"},{url:"/static/js/runtime~main.e1c301f3.js",revision:"0de74a7896ec9363020cd5976117a249"}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
