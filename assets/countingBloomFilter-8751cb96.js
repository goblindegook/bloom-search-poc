import{u as h,D as y,o as l,N as b,c as x,k as w}from"./Navigation-9d99fedb.js";import{I as v}from"./Input-c190a520.js";import{S as A,r as I}from"./xxh64-u64-498173eb.js";import{A as S,F as k,h as C}from"./hash-e59e98f5.js";const o=h(100),g=h(3),s=h([]),t=h(Array(o.value).fill(0)),r=h({word:"",index:-1,hashes:[]}),d=h({word:"",hashes:[]});function D(){const u=e=>I(0,g.value).map(a=>C(a,e)%o.value),p=()=>{s.value=[],t.value=Array(o.value).fill(0),r.value={word:"",index:-1,hashes:[]}},m=d.value.word.length>0,c=Math.min(...d.value.hashes.map(e=>t.value[e]));return l(w,{children:[l(b,{}),l("div",{class:"p-8",children:[l("h1",{class:"text-4xl font-extrabold leading-none tracking-tight text-gray-900 pb-8",children:"Counting Bloom Filter"}),l("div",{class:"grid grid-cols-4 gap-8",children:[l("div",{class:"bg-gray-100 p-8 rounded-lg shadow-sm",children:[l(v,{id:"size",label:"Size",onChange:e=>{o.value=parseInt(e.target.value,10),p()},value:o,type:"number"}),l(v,{id:"hashes",label:"Hashes",onChange:e=>{g.value=parseInt(e.target.value,10),p()},value:g,type:"number"}),l(v,{id:"add",label:"Add Text",onKeyUp:e=>{if(e.key==="Enter"){const a=e.target.value;if(a.length>0){const i=u(a);s.value=s.value.concat(a),i.forEach(n=>{t.value[n]=t.value[n]+1}),r.value={word:a,index:s.value.length-1,hashes:i}}e.target.value=""}}}),l("ul",{children:s.value.map((e,a)=>{const i=a===r.value.index;return l(S,{value:e,highlighted:i,onClick:n=>{n.preventDefault(),r.value=i?{word:"",index:-1,hashes:[]}:{word:e,index:a,hashes:u(e)}},onRemove:n=>{n.preventDefault(),u(e).forEach(f=>{t.value[f]=t.value[f]-1}),s.value=s.value.slice(0,a).concat(s.value.slice(a+1,s.value.length)),r.value={word:"",index:-1,hashes:[]}}})})})]}),l("div",{class:"col-span-3",children:[l(A,{id:"search",label:"Search",onKeyUp:e=>{const a=e.target.value;d.value={word:a,hashes:a.length?u(a):[]}},children:m&&l("div",{class:x("text-white absolute right-2.5 bottom-2.5 font-medium rounded-lg text-md px-4 py-2",c>0?"bg-emerald-700":"bg-rose-700"),children:c>0?`Probably found ${c}`:"Definitely missing"})}),l("ul",{class:"grid grid-cols-10 justify-evenly justify-items-center gap-4 m-12",children:t.value.map((e,a)=>l(k,{value:e,index:a,highlighted:r.value.hashes.includes(a),searched:m&&d.value.hashes.includes(a)}))})]})]})]})]})}y(l(D,{}),document.getElementById("app"));
