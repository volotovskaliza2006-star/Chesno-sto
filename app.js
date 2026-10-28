const CITIES=["Київ","Львів","Тернопіль","Одеса","Харків","Дніпро"];
const CRIT=[["quality","Якість"],["price","Ціна"],["service","Сервіс"],["honesty","Чесність"]];
const SERV=["ТО","Діагностика","Шиномонтаж","Кузовний ремонт"];
const BASE=["АвтоМайстер","Гараж 77","ТурбоСервіс","Чесний Мотор","Колесо","Мотор-Плюс","ПітСтоп","Автодок"];
const STR=["вул. Заводська","просп. Свободи","вул. Шевченка","вул. Промислова","вул. Гаражна"];
const AUTH=["Андрій","Олена","Максим","Ірина","Богдан","Наталія","Олег","Софія"];
const HI=["Діагностику зробили чесно, зайвого не нав’язували.","Назвали ціну наперед і не змінили її після ремонту.","Показали замінені деталі та пояснили, що саме зламалось.","Зробили швидко, у строк, машина їде як нова."];
const MID=["Ремонт якісний, але довелося чекати довше, ніж обіцяли.","Ціна трохи вища за середню, зате є гарантія на роботу."];
const LO=["Додали до рахунку роботи, про які ми не домовлялись.","Адміністратор ввічливий, але причину поломки так і не пояснили."];
const CARS=["Toyota Camry","Skoda Octavia","VW Golf","Renault Duster","Hyundai Tucson","Ford Focus","BMW 320","Kia Sportage"];
const REP=["Заміна гальмівних колодок","Заміна ременя ГРМ","Ремонт підвіски","Заміна масла та фільтрів","Ремонт кондиціонера","Заміна амортизаторів","Рихтування крила","Шиномонтаж і балансування"];
const BR=["Toyota","Volkswagen","Skoda","Renault","Hyundai","Kia","Ford","BMW","Mercedes-Benz","Opel","Honda","Nissan"];
const rnd=s=>{s=Math.sin(s)*1e4;return s-Math.floor(s)};
const clamp=n=>Math.max(1,Math.min(5,Math.round(n)));
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const STOS=[];
CITIES.forEach((c,ci)=>{for(let i=0;i<5;i++){
  const id=ci+"-"+i,seed=ci*10+i+1,sc={};
  CRIT.forEach(([k],j)=>sc[k]=Math.round((3+rnd(seed*7+j)*1.9)*10)/10);
  const reviews=[0,1,2].map(r=>{const s={};CRIT.forEach(([k])=>s[k]=clamp(sc[k]+(rnd(seed*13+r*3+k.length)-.5)*2-(r===0&&rnd(seed*5)>.4?2.2:0)));
    const a=avg(Object.values(s)),p=a>=4?HI:a>=3?MID:LO;
    return{car:CARS[(seed+r*2)%8],rep:REP[(seed*2+r)%8],photo:a<3?"photos/problem-"+(1+(seed+r)%4)+".jpg":"",name:AUTH[(seed+r*3)%8],date:`${10+r*7}.0${(seed%6)+3}.2026`,text:p[Math.floor(rnd(seed+r)*p.length)],s}});
  STOS.push({id,city:c,name:BASE[(ci*3+i)%8]+(i>4?"":" "+c.slice(0,3)+"."),addr:`${STR[i]}, ${1+Math.floor(rnd(seed)*90)}`,
    serv:SERV.filter((_,j)=>rnd(seed+j*5)>.4||j===i%4),sc,reviews,brands:(()=>{const b=BR.filter((_,j)=>rnd(seed*3+j)>.6);return b.length>=3?b:BR.slice(i,i+4)})()});}});
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let city=store.get("city",CITIES.includes("Тернопіль")?"Київ":"Київ");
const extra=()=>store.get("reviews",[]);
const revs=s=>[...extra().filter(r=>r.id===s.id),...s.reviews];
const score=s=>{const r=revs(s),o={};CRIT.forEach(([k])=>o[k]=(s.sc[k]*3+r.slice(0,r.length-3).reduce((a,x)=>a+x.s[k],0))/(3+r.length-3));return o};
const total=s=>avg(Object.values(score(s)));
const tyre='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" stroke-width="4.6"/><circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.45"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg>';
const tyres=v=>`<span class="tyres" role="img" aria-label="${v.toFixed(1)} з 5 шин">${[1,2,3,4,5].map(i=>`<span class="${i<=Math.round(v)?"f":""}">${tyre}</span>`).join("")}</span>`;
const cityList=()=>STOS.filter(s=>s.city===city);
const card=s=>`<a class="card" href="#/sto/${s.id}"><h3>${esc(s.name)}</h3>${tyres(total(s))}<span class="num">${total(s).toFixed(1)}</span><p>${esc(s.addr)}, ${city}</p><p>${s.serv.map(x=>`<span class="tag">${x}</span>`).join("")}</p><p>Марки: ${s.brands.slice(0,4).join(", ")}${s.brands.length>4?" та інші":""}</p><p>Відгуків: ${revs(s).length}</p></a>`;
const shrink=f=>new Promise((ok,no)=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const k=Math.min(1,800/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",.7))};im.onerror=no;im.src=u});
const ph=()=>{const d=document.createElement("div");d.className="ph";d.innerHTML=tyre+"<span>Фото ремонту (приклад)</span>";return d};
const $=q=>document.querySelector(q),app=$("#app");
const sel=$("#city");sel.innerHTML=CITIES.map(c=>`<option>${c}</option>`).join("");sel.value=city;
sel.onchange=()=>{city=sel.value;store.set("city",city);route()};
const V={
home(){const l=[...cityList()].sort((a,b)=>total(b)-total(a)).slice(0,3),n=cityList().reduce((a,s)=>a+revs(s).length,0);
 return`<section class="hero"><h1>Знайдіть СТО,<br>якому можна довіряти</h1><p>Рейтинг станцій техобслуговування за відгуками водіїв. Оцінки в шинах: якість, ціна, сервіс і чесність.</p><a class="btn" href="#/rating">Дивитися рейтинг: ${city}</a> <a class="btn ghost" href="#/review">Залишити відгук</a></section>
 <h2>Найкращі СТО міста ${city}</h2><div class="grid">${l.map(card).join("")}</div><p>У місті ${city}: ${cityList().length} СТО та ${n} відгуків.</p>
 <h2 style="margin-top:40px">Як це працює</h2><ol class="steps"><li>Оберіть своє місто у верхньому меню.</li><li>Порівняйте СТО за шинами та послугами.</li><li>Після візиту залиште відгук і допоможіть іншим водіям.</li></ol>`},
rating(){return`<h1 style="font-size:2rem">Рейтинг СТО: ${city}</h1><div class="row"><input id="q" placeholder="Пошук за назвою чи адресою" aria-label="Пошук"><select id="sv"><option value="">Усі послуги</option>${SERV.map(x=>`<option>${x}</option>`).join("")}</select><select id="br"><option value="">Усі марки авто</option>${BR.map(x=>`<option>${x}</option>`).join("")}</select><select id="so"><option value="t">За загальною оцінкою</option>${CRIT.map(([k,n])=>`<option value="${k}">За критерієм: ${n}</option>`).join("")}</select></div><div class="grid" id="list"></div>`},
sto(id){const s=STOS.find(x=>x.id===id);if(!s)return V.nf();const sc=score(s);
 return`<a href="#/rating">← До рейтингу</a><h1 style="font-size:2rem;margin-top:10px">${esc(s.name)}</h1><p>${esc(s.addr)}, ${s.city}. ${s.serv.map(x=>`<span class="tag">${x}</span>`).join("")}</p><p><b>Ремонтуємо авто марок:</b> ${s.brands.map(b=>`<span class="tag">${b}</span>`).join("")}</p><div class="big">${tyres(total(s))}<span class="num">${total(s).toFixed(1)}</span></div>
 <div class="card" style="margin:20px 0">${CRIT.map(([k,n])=>`<div class="crit"><span>${n}</span><span>${tyres(sc[k])}</span></div>`).join("")}</div>
 <a class="btn" href="#/review/${s.id}">Залишити відгук</a><h2 style="margin-top:36px">Відгуки (${revs(s).length})</h2>
 ${revs(s).map(r=>`<div class="rev"><b>${esc(r.name)}</b> <small>${esc(r.date)}</small>${r.car?`<p class="meta">Авто: <b>${esc(r.car)}</b> · Відремонтовано: <b>${esc(r.rep)}</b></p>`:""}<p>${esc(r.text)}</p>${r.photo?`<img class="rp" src="${r.photo}" alt="Фото ремонту" onerror="this.replaceWith(ph())">`:""}<small>${CRIT.map(([k,n])=>`${n}: ${r.s[k]}/5`).join(" · ")}</small></div>`).join("")}`},
review(id){const l=cityList(),v={};
 return`<h1 style="font-size:2rem">Залишити відгук</h1><p>Місто: ${city}. Відгук збережеться лише у вашому браузері.</p><form id="f"><label class="w">СТО<select id="fs">${l.map(s=>`<option value="${s.id}"${s.id===id?" selected":""}>${esc(s.name)}</option>`).join("")}</select></label>
 ${CRIT.map(([k,n])=>`<label>${n}<span class="pick" data-k="${k}">${[1,2,3,4,5].map(i=>`<button type="button" data-v="${i}" aria-label="${i} з 5">${tyre}</button>`).join("")}</span></label>`).join("")}
 <label class="h">Марка й модель авто<input id="fc" required maxlength="40" placeholder="Напр., Skoda Octavia"></label><label class="h">Що відремонтовано<input id="fr" required maxlength="80" placeholder="Напр., заміна гальмівних колодок"></label><label class="w">Фото ремонту (необов’язково)<input id="fp" type="file" accept="image/*"></label>
 <label class="w">Ваше ім’я<input id="fn" required maxlength="40"></label><label class="w">Відгук<textarea id="ft" rows="4" required maxlength="500"></textarea></label><button class="btn">Опублікувати</button></form>`},
about(){return`<h1 style="font-size:2rem">Про проєкт</h1><p>«ЧесноСТО» — незалежна рейтингова платформа з відгуками про станції технічного обслуговування. Водій обирає СТО за відгуками інших водіїв, а не за рекламою, а власники сервісів отримують чесний зворотний зв’язок.</p><p>Оцінка складається з чотирьох критеріїв: якість, ціна, сервіс і чесність. Кожен критерій оцінюється від 1 до 5 шин.</p><p>Цей сайт — навчальний демонстраційний проєкт. Назви СТО й відгуки вигадані.</p>`},
contacts(){return`<h1 style="font-size:2rem">Контакти</h1><p>Напишіть нам: <a href="mailto:y.volotovska_femp_18_24_b_d@knute.edu.ua">y.volotovska_femp_18_24_b_d@knute.edu.ua</a></p><form id="cf"><label>Ім’я<input required></label><label>Повідомлення<textarea rows="4" required></textarea></label><button class="btn">Надіслати</button></form><div id="cm"></div>`},
nf(){return`<h1>Сторінку не знайдено</h1><a href="#/">На головну</a>`}};
function route(){const[,p,a]=(location.hash||"#/").slice(1).split("/");const k=p||"home";
 document.querySelectorAll("#nav a").forEach(x=>x.classList.toggle("on",x.getAttribute("href")==="#/"+(p||"")));
 app.innerHTML=(V[k]||V.nf)(a);scrollTo(0,0);document.title="ЧесноСТО — "+(k==="home"?"рейтинг СТО":k);
 if(k==="rating"){const draw=()=>{const q=$("#q").value.toLowerCase(),sv=$("#sv").value,br=$("#br").value,so=$("#so").value;
  const l=cityList().filter(s=>(s.name+s.addr).toLowerCase().includes(q)&&(!sv||s.serv.includes(sv))&&(!br||s.brands.includes(br))).sort((a,b)=>so==="t"?total(b)-total(a):score(b)[so]-score(a)[so]);
  $("#list").innerHTML=l.map(card).join("")||"<p>Нічого не знайдено. Змініть пошук чи фільтр.</p>"};
  ["q","sv","br","so"].forEach(i=>$("#"+i).oninput=draw);draw()}
 if(k==="review"){const v={};document.querySelectorAll(".pick").forEach(g=>g.onclick=e=>{const b=e.target.closest("button");if(!b)return;v[g.dataset.k]=+b.dataset.v;g.querySelectorAll("button").forEach(x=>x.classList.toggle("f",+x.dataset.v<=v[g.dataset.k]))});
  $("#f").onsubmit=async e=>{e.preventDefault();if(CRIT.some(([c])=>!v[c])){alert("Оцініть усі чотири критерії шинами.");return}
   const id=$("#fs").value,f=$("#fp").files[0];let photo="";if(f)try{photo=await shrink(f)}catch(x){}
   const r={id,user:1,car:$("#fc").value.trim(),rep:$("#fr").value.trim(),photo,name:$("#fn").value.trim(),text:$("#ft").value.trim(),s:{...v},date:new Date().toLocaleDateString("uk-UA")};
   store.set("reviews",[r,...extra()]);location.hash="#/sto/"+id}}
 if(k==="contacts")$("#cf").onsubmit=e=>{e.preventDefault();e.target.reset();$("#cm").innerHTML='<p class="ok">Дякуємо! Повідомлення прийнято (демонстрація).</p>'}}
addEventListener("hashchange",route);route();
