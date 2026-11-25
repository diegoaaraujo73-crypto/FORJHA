/* FORJHA PRO — interações */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fine=matchMedia('(hover:hover)').matches;
// Barra de progresso + voltar ao topo
const bar=document.createElement('div');bar.id='fp-progress';document.body.append(bar);
const top=document.createElement('button');top.id='fp-top';top.className='fp-fab';top.setAttribute('aria-label','Voltar ao topo');top.innerHTML='<i class="bi bi-arrow-up"></i>';document.body.append(top);
top.onclick=()=>scrollTo({top:0});
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;bar.style.width=(scrollY/h*100)+'%';top.classList.toggle('show',scrollY>600);const hi=$('.hero .container');if(hi&&scrollY<innerHeight)hi.style.transform=`translateY(${scrollY*.15}px)`},{passive:true});
// Brilho que segue o mouse
if(fine){const g=document.createElement('div');g.id='fp-glow';document.body.append(g);addEventListener('mousemove',e=>{g.style.transform=`translate(${e.clientX}px,${e.clientY}px)`},{passive:true})}
// Reveal ao rolar
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('fp-in');io.unobserve(e.target)}}),{threshold:.12});
const reveal=()=>$$('.section-title,.section-sub,.feature-card,.fp-step,.fp-calc,.fp-faq details,.testimonial-card,.hero-stats>div,.forjha-kit-section .container>*,#productsGrid>*').forEach((el,i)=>{if(el.dataset.fp)return;el.dataset.fp=1;el.classList.add('fp-rev');el.style.setProperty('--d',(i%4)*.08+'s');io.observe(el)});
reveal();
new MutationObserver(reveal).observe($('#productsGrid')||document.body,{childList:true});
// Tilt 3D nos cards
if(fine)document.addEventListener('mousemove',e=>{const c=e.target.closest?.('.product-card');$$('.fp-tilt').forEach(t=>{if(t!==c){t.style.transform='';t.classList.remove('fp-tilt')}});if(!c)return;c.classList.add('fp-tilt');const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-6px)`},{passive:true});
// Contadores
const count=(el,to,suf='')=>{const t0=performance.now();const f=n=>{const p=Math.min((n-t0)/1600,1);el.firstChild.textContent=Math.floor((1-Math.pow(1-p,3))*to).toLocaleString('pt-BR');if(p<1)requestAnimationFrame(f);else el.firstChild.textContent=to.toLocaleString('pt-BR')};requestAnimationFrame(f)};
const co=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){count(e.target,+e.target.dataset.to);co.unobserve(e.target)}}));
$$('.fp-stat b').forEach(b=>co.observe(b));
// Digitação no hero
const d=$('.hero-desc');if(d){const frases=['Roupas e acessórios para acompanhar sua rotina de treino.','Conforto que aguenta o seu ritmo.','Vista sua evolução com a FORJHA.'];d.classList.add('fp-type');let i=0,j=0,del=false;(function tick(){const s=frases[i];d.firstChild.textContent=s.slice(0,j);if(!del&&j===s.length){del=true;return setTimeout(tick,2200)}if(del&&j===0){del=false;i=(i+1)%frases.length}j+=del?-1:1;setTimeout(tick,del?22:45)})()}
// Calculadora
const calc=$('#fpCalc');if(calc){const run=()=>{const v=n=>+calc.elements[n].value;const peso=v('peso'),alt=v('altura'),age=v('idade');if(!peso||!alt||!age)return;
const tmb=10*peso+6.25*alt-5*age+(calc.elements.sexo.value==='m'?5:-161),kcal=Math.round(tmb*+calc.elements.nivel.value),meta={cut:-400,man:0,bulk:350}[calc.elements.meta.value],prot=Math.round(peso*(calc.elements.meta.value==='cut'?2.2:1.8));
$('#rKcal').textContent=kcal+meta;$('#rProt').textContent=prot+'g';$('#rAgua').textContent=(peso*.035).toFixed(1)+'L'};calc.addEventListener('input',run);run()}
// WhatsApp
const WHATSAPP_NUMBER='5516999990000';
const wa=document.createElement('a');wa.id='fp-wa';wa.className='fp-fab';wa.href=`https://wa.me/${WHATSAPP_NUMBER}?text=`+encodeURIComponent('Olá! Vim pelo site da FORJHA.');wa.target='_blank';wa.rel='noopener';wa.setAttribute('aria-label','Falar no WhatsApp');wa.innerHTML='<i class="bi bi-whatsapp"></i>';document.body.append(wa);
// Scrollspy
const links=$$('.nav-link-forjha[href^="#"]');const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>{l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id)})}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(l=>{const s=$(l.getAttribute('href'));s&&so.observe(s)});
})();
// Player flutuante: minimizar/expandir e animação ao tocar
(()=>{const p=document.getElementById('fpMusic'),t=document.getElementById('fpMusicToggle'),a=document.getElementById('forjhaAudio');if(!p)return;
const set=m=>{p.classList.toggle('is-min',m);t.setAttribute('aria-expanded',String(!m));t.setAttribute('aria-label',m?'Expandir player':'Minimizar player');try{localStorage.setItem('fpMusicMin',m?'1':'0')}catch{}};
let saved=null;try{saved=localStorage.getItem('fpMusicMin')}catch{}
set(saved===null?matchMedia('(max-width:575.98px)').matches:saved==='1');
t.onclick=()=>set(true);
p.querySelector('.music-player-icon').onclick=()=>{if(p.classList.contains('is-min'))set(false)};
if(a){const s=()=>p.classList.toggle('is-playing',!a.paused);['play','pause','ended'].forEach(e=>a.addEventListener(e,s));s()}
})();
