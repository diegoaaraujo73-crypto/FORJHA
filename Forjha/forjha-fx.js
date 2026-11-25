/* Efeitos visuais compartilhados da FORJHA — inspirado em carrosséis, brilho e feedback tátil. */
(() => {
  const D = document, W = window;
  const reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
  html { scroll-behavior: smooth; }
  .fx-progress{position:fixed;left:0;top:0;height:3px;width:0%;z-index:2147483000;background:linear-gradient(90deg,var(--forjha-orange,#ff4d00),#ffb36b);box-shadow:0 0 12px rgba(255,77,0,.7);pointer-events:none}
  .fx-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;contain:strict}
  .fx-blob{position:absolute;width:55vmax;height:55vmax;border-radius:50%;filter:blur(55px);opacity:.12;will-change:transform;background:radial-gradient(circle,#ff4d00 0%,transparent 68%)}
  .fx-b1{left:-30vmax;top:-25vmax;animation:fxMove1 18s ease-in-out infinite alternate}.fx-b2{right:-32vmax;bottom:-30vmax;animation:fxMove2 22s ease-in-out infinite alternate}
  @keyframes fxMove1{to{transform:translate3d(32vw,18vh,0) scale(1.12)}}@keyframes fxMove2{to{transform:translate3d(-28vw,-16vh,0) scale(.92)}}
  .fx-p{position:absolute;bottom:-12px;width:3px;height:3px;border-radius:50%;background:#ff7040;box-shadow:0 0 8px #ff7040;opacity:0;animation:fxRise var(--d) linear var(--w) infinite}
  @keyframes fxRise{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:.6}90%{opacity:.25}100%{transform:translate3d(var(--dx),-112vh,0);opacity:0}}
  #fxTop{position:fixed;right:20px;bottom:20px;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(17,17,17,.88);backdrop-filter:blur(10px);color:#fff;z-index:1500;display:grid;place-items:center;opacity:0;visibility:hidden;transform:translateY(12px);transition:.25s ease;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  #fxTop.on{opacity:1;visibility:visible;transform:translateY(0)}#fxTop:hover{background:#ff4d00;border-color:#ff4d00}
  .fx-reveal{opacity:0!important;transform:translateY(22px)!important;transition:opacity .65s ease,transform .65s cubic-bezier(.2,.7,.2,1)!important}.fx-reveal.is-visible{opacity:1!important;transform:translateY(0)!important}
  .fx-tilt{transform-style:preserve-3d;will-change:transform}.fx-glow{position:relative;overflow:hidden}.fx-glow::after{content:'';position:absolute;inset:-150% -50%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.14) 50%,transparent 60%);transform:translateX(-70%);transition:transform .7s ease;pointer-events:none}.fx-glow:hover::after{transform:translateX(70%)}
  #fxIntro{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;background:radial-gradient(circle at 50%,#241006 0%,#090706 58%,#020202 100%);color:#ff4d00;transition:opacity .55s ease,visibility .55s ease}
  #fxIntro.off{opacity:0;visibility:hidden}#fxIntro .fx-intro-brand{font-family:'Bebas Neue',sans-serif;font-size:clamp(4rem,14vw,9rem);letter-spacing:.12em;line-height:1;text-shadow:0 0 30px rgba(255,77,0,.28);animation:fxIntroIn .8s cubic-bezier(.2,.8,.2,1) both}#fxIntro .fx-intro-brand span{color:#fff}@keyframes fxIntroIn{from{opacity:0;transform:scale(.72);filter:blur(8px)}to{opacity:1;transform:scale(1);filter:blur(0)}}
  .fx-skip{position:absolute;right:24px;bottom:24px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.35);color:#fff;border-radius:999px;padding:8px 16px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.12em;text-transform:uppercase}
  body.fx-ready{animation:fxPageIn .45s ease both}@keyframes fxPageIn{from{opacity:.7}to{opacity:1}}
  @media(max-width:767px){#fxTop{right:14px;bottom:14px;width:42px;height:42px}.fx-blob{filter:blur(38px);opacity:.09}}
  @media(prefers-reduced-motion:reduce){.fx-bg,#fxIntro{display:none}.fx-reveal{opacity:1!important;transform:none!important}.fx-tilt{transform:none!important}}
  `;
  const st=D.createElement('style'); st.textContent=css; D.head.appendChild(st);

  if(!reduce){
    const bg=D.createElement('div'); bg.className='fx-bg'; bg.setAttribute('aria-hidden','true');
    bg.innerHTML='<div class="fx-blob fx-b1"></div><div class="fx-blob fx-b2"></div>'+Array.from({length:W.innerWidth<640?8:14},()=>`<i class="fx-p" style="left:${Math.random()*100}%;--d:${12+Math.random()*12}s;--w:-${Math.random()*20}s;--dx:${Math.round(-55+Math.random()*110)}px"></i>`).join('');
    D.body.appendChild(bg);

    if(!sessionStorage.getItem('forjhaFxIntro')){
      const intro=D.createElement('div'); intro.id='fxIntro'; intro.innerHTML='<div class="fx-intro-brand">FOR<span>JHA</span></div><button class="fx-skip" type="button">Pular</button>'; D.body.appendChild(intro);
      sessionStorage.setItem('forjhaFxIntro','1');
      const close=()=>intro.classList.add('off');
      intro.querySelector('.fx-skip').addEventListener('click',close);
      intro.addEventListener('click',e=>{if(e.target===intro)close()});
      setTimeout(close,2200);
    }
  }

  const prog=D.createElement('div'); prog.className='fx-progress'; D.body.appendChild(prog);
  const top=D.createElement('button'); top.id='fxTop'; top.type='button'; top.setAttribute('aria-label','Voltar ao topo'); top.innerHTML='<i class="bi bi-arrow-up"></i>'; D.body.appendChild(top);
  top.addEventListener('click',()=>W.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

  function updateScroll(){
    const max=D.documentElement.scrollHeight-W.innerHeight;
    prog.style.width=(max>0?(W.scrollY/max*100):0)+'%';
    top.classList.toggle('on',W.scrollY>600);
  }
  W.addEventListener('scroll',updateScroll,{passive:true}); updateScroll();

  D.addEventListener('DOMContentLoaded',()=>{
    D.body.classList.add('fx-ready');
    const targets=D.querySelectorAll('.product-card,.testimonial-card,.feature-card,.value-card,.section-title,.newsletter-section,.model-slider');
    targets.forEach(el=>{el.classList.add('fx-reveal','fx-glow')});
    if(!reduce&&'IntersectionObserver'in W){
      const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');ob.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px'});
      targets.forEach(el=>ob.observe(el));
    }else targets.forEach(el=>el.classList.add('is-visible'));

    if(!reduce&&W.matchMedia('(hover:hover) and (pointer:fine)').matches){
      D.querySelectorAll('.product-card,.feature-card,.value-card').forEach(card=>{
        card.classList.add('fx-tilt');
        card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateY(${x*3}deg) rotateX(${y*-3}deg) translateY(-4px)`});
        card.addEventListener('mouseleave',()=>{card.style.transform=''});
      });
    }
  });

  /* ===== Pacote completo de microinterações ===== */
  st.textContent += `
  body { --fx-enter-x: 0px; }
  .navbar-forjha { transition: padding .25s ease, background .25s ease, box-shadow .25s ease; }
  .navbar-forjha.scrolled, .navbar-forjha.fx-scrolled { padding-top:.25rem!important; padding-bottom:.25rem!important; background:rgba(10,10,10,.94)!important; box-shadow:0 12px 28px rgba(0,0,0,.28); }
  .fx-ripple { position:absolute; border-radius:50%; background:rgba(255,255,255,.38); transform:scale(0); animation:fxRipple .62s linear; pointer-events:none; }
  @keyframes fxRipple { to { transform:scale(4); opacity:0; } }
  .fx-cart-pop { animation:fxCartPop .55s cubic-bezier(.2,.9,.2,1); }
  @keyframes fxCartPop { 35%{transform:scale(1.32) rotate(-8deg)}70%{transform:scale(.92) rotate(5deg)}100%{transform:none} }
  .fx-confetti { position:fixed; z-index:2147483600; width:8px; height:14px; pointer-events:none; border-radius:2px; animation:fxConfetti 1.8s cubic-bezier(.12,.7,.35,1) forwards; }
  @keyframes fxConfetti { from{transform:translate3d(0,-20px,0) rotate(0)} to{transform:translate3d(var(--x),var(--y),0) rotate(var(--r));opacity:0} }
  .fx-magnetic { transition:transform .18s cubic-bezier(.2,.7,.2,1)!important; }
  .fx-page-out { opacity:0!important; transform:translateY(-8px)!important; transition:opacity .25s ease,transform .25s ease!important; }
  img.fx-loaded { animation:fxImageIn .7s ease both; }
  @keyframes fxImageIn { from{opacity:.2;filter:blur(8px)}to{opacity:1;filter:blur(0)} }
  .fx-filter-hit { animation:fxFilterHit .42s ease; }
  @keyframes fxFilterHit { 50%{border-color:var(--forjha-orange);box-shadow:0 0 0 4px rgba(255,77,0,.12)} }
  .fx-loading { position:relative!important; color:transparent!important; pointer-events:none!important; }
  .fx-loading::after { content:''; position:absolute; width:16px;height:16px;left:50%;top:50%;margin:-8px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:fxSpin .7s linear infinite; }
  @keyframes fxSpin { to{transform:rotate(360deg)} }
  @media(prefers-reduced-motion:reduce){.navbar-forjha,.fx-magnetic,body,.fx-loading::after{animation:none!important;transition:none!important}.fx-ripple,.fx-confetti{display:none!important}}
  `;

  const navbar = D.querySelector('.navbar-forjha');
  const updateNavbar = () => navbar?.classList.toggle('fx-scrolled', W.scrollY > 24);
  W.addEventListener('scroll', updateNavbar, {passive:true});
  updateNavbar();

  D.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button,a,.cat-card') : null;
    if (!target || reduce) return;

    const rect = target.getBoundingClientRect();
    const ripple = D.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'fx-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);

    const label = (target.textContent || '').toLowerCase();
    if (label.includes('carrinho') || target.classList.contains('btn-cart')) {
      target.classList.remove('fx-cart-pop');
      void target.offsetWidth;
      target.classList.add('fx-cart-pop');
    }
  });

  D.querySelectorAll('img').forEach(img => {
    if (img.complete) img.classList.add('fx-loaded');
    else img.addEventListener('load', () => img.classList.add('fx-loaded'), {once:true});
  });

  D.querySelectorAll('button, .btn').forEach(button => {
    if (!button.closest('.intro-skip') && W.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      button.classList.add('fx-magnetic');
      button.addEventListener('mousemove', event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .12;
        const y = (event.clientY - rect.top - rect.height / 2) * .12;
        button.style.transform = `translate(${x}px,${y}px)`;
      });
      button.addEventListener('mouseleave', () => button.style.transform = '');
    }
  });

  if (!reduce) {
    D.querySelectorAll('[data-count]').forEach(counter => {
      const end = Number(counter.dataset.count || 0);
      const duration = 1100;
      const start = performance.now();
      const step = now => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = Math.round(end * (1 - Math.pow(1 - progress, 3))).toLocaleString('pt-BR');
        if (progress < 1) requestAnimationFrame(step);
      };
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step);
          observer.disconnect();
        }
      }, {threshold:.5});
      observer.observe(counter);
    });

    D.addEventListener('submit', event => {
      const button = event.submitter;
      if (button) {
        button.classList.add('fx-loading');
        setTimeout(() => button.classList.remove('fx-loading'), 900);
      }
    });

    D.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', event => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || event.ctrlKey || event.metaKey) return;
        if (link.hasAttribute('download')) return;
        event.preventDefault();
        D.body.classList.add('fx-page-out');
        setTimeout(() => { W.location.href = href; }, 260);
      });
    });
  }

  window.forjhaConfetti = (originX = W.innerWidth / 2, originY = W.innerHeight / 2, amount = 70) => {
    if (reduce) return;
    const colors = ['#ff4d00','#ffb36b','#ffffff','#ffd34d','#ff6b35'];
    for (let i = 0; i < amount; i++) {
      const piece = D.createElement('i');
      piece.className = 'fx-confetti';
      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--x', `${Math.round(-360 + Math.random()*720)}px`);
      piece.style.setProperty('--y', `${Math.round(180 + Math.random()*420)}px`);
      piece.style.setProperty('--r', `${Math.round(-720 + Math.random()*1440)}deg`);
      D.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1900);
    }
  };

  // Estado visual do cabeçalho e navegação mobile mais fluida.
  const navBar = D.querySelector('.navbar-forjha');
  const syncNav = () => {
    if (navBar) navBar.classList.toggle('scrolled', W.scrollY > 24);
  };
  W.addEventListener('scroll', syncNav, {passive:true});
  syncNav();

  D.querySelectorAll('.navbar-collapse .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const menu = link.closest('.navbar-collapse');
      if (menu && menu.classList.contains('show') && W.bootstrap?.Collapse) {
        W.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  // Pequeno feedback ao filtrar ou trocar categoria, sem alterar a lógica da loja.
  D.addEventListener('input', event => {
    if (event.target.matches('#searchInput,#searchInput2')) {
      D.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('fx-filter-hit');
        if (card.offsetParent !== null) {
          void card.offsetWidth;
          card.classList.add('fx-filter-hit');
        }
      });
    }
  });

})();
