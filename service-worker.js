if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,t)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(s[c])return;let r={};const l=e=>i(e,c),u={module:{uri:c},exports:r,require:l};s[c]=Promise.all(n.map((e=>u[e]||l(e)))).then((e=>(t(...e),r)))}}define(["./workbox-8738f3ab"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.clientsClaim(),e.precacheAndRoute([{url:"/index.html",revision:"072af2da29cf9b9f75ccc9bb8686fc2a"},{url:"/static/css/2.a36ba91f.chunk.css",revision:null},{url:"/static/css/main.1aeab01b.chunk.css",revision:null},{url:"/static/js/2.0de73276.chunk.js",revision:null},{url:"/static/js/2.0de73276.chunk.js.LICENSE.txt",revision:"81896c98bac7b5b16ab1d3790da5b937"},{url:"/static/js/main.f614a1c2.chunk.js",revision:null},{url:"/static/js/runtime~main.e3cfefeb.js",revision:null}],{}),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"),{denylist:[/^\/_/,/\/[^/]+\.[^/]+$/]}))}));
//# sourceMappingURL=service-worker.js.map
