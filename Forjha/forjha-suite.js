(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const session=()=>{try{return JSON.parse(localStorage.getItem('forjhaSession')||'null')}catch{return null}};
const toast=t=>{let el=$('.fj-toast-mini')||document.createElement('div');if(!el.classList.contains('fj-toast-mini')){el.className='fj-toast-mini';document.body.append(el)}el.textContent=t;el.classList.add('show');clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),2600)};
window.fjToast=toast;

// Tema claro/escuro
const savedTheme=localStorage.getItem('forjhaTheme')||'dark';
const applyTheme=t=>{document.documentElement.classList.toggle('light-theme',t==='light');localStorage.setItem('forjhaTheme',t)};
applyTheme(savedTheme);

// Conta e navegação
function setupAccount(){
 const nav=$('.navbar-forjha .d-flex.align-items-center.gap-2');if(!nav||$('#fjAccount'))return;
 const wrap=document.createElement('div');wrap.id='fjAccount';wrap.className='fj-account-menu';
 const u=session();
 wrap.innerHTML=u?`<button class="fj-account-btn" type="button" aria-expanded="false"><i class="bi bi-person-circle"></i> <span>${u.name.split(' ')[0]}</span></button><div class="fj-account-popup"><a href="pedidos.html"><i class="bi bi-box-seam"></i> Meus pedidos</a><a href="#" data-fj-favorites><i class="bi bi-heart"></i> Favoritos</a><button type="button" data-fj-reviews><i class="bi bi-star"></i> Avaliar produtos</button><button type="button" data-fj-logout><i class="bi bi-box-arrow-right"></i> Sair</button></div>`:`<a class="fj-account-btn" href="login.html" aria-label="Entrar ou cadastrar"><i class="bi bi-person-circle"></i> <span>Entrar</span></a>`;
 nav.prepend(wrap);
 const btn=$('.fj-account-btn',wrap),popup=$('.fj-account-popup',wrap);
 btn?.addEventListener('click',()=>{popup.classList.toggle('open');btn.setAttribute('aria-expanded',String(popup.classList.contains('open')))});
 document.addEventListener('click',e=>{if(!wrap.contains(e.target))popup?.classList.remove('open')});
 $('[data-fj-logout]',wrap)?.addEventListener('click',()=>{localStorage.removeItem('forjhaSession');location.href='login.html'});
 $('[data-fj-favorites]',wrap)?.addEventListener('click',e=>{e.preventDefault();window.toggleFavoritesFilter?.();document.querySelector('#produtos')?.scrollIntoView({behavior:'smooth'})});
 $('[data-fj-reviews]',wrap)?.addEventListener('click',()=>openReviewModal());
 const theme=document.createElement('button');theme.type='button';theme.className='fj-theme-toggle';theme.setAttribute('aria-label','Alternar tema claro/escuro');theme.innerHTML=`<i class="bi ${document.documentElement.classList.contains('light-theme')?'bi-moon-stars':'bi-sun'}"></i>`;theme.onclick=()=>{const light=!document.documentElement.classList.contains('light-theme');applyTheme(light?'light':'dark');theme.innerHTML=`<i class="bi ${light?'bi-moon-stars':'bi-sun'}"></i>`};nav.prepend(theme);
}

document.addEventListener('DOMContentLoaded',setupAccount);

// Cupons e frete no carrinho
function setupCartExtras(){
 const footer=$('#cartFooter');if(!footer||$('#fjCartExtras'))return;
 const box=document.createElement('div');box.id='fjCartExtras';box.className='fj-cart-extras';
 box.innerHTML=`<div class="fj-field-row mb-2"><input id="fjCoupon" placeholder="Cupom de desconto" aria-label="Cupom de desconto"><button type="button" class="btn btn-outline-forjha btn-sm" id="fjApplyCoupon">Aplicar</button></div><div class="fj-field-row mb-1"><input id="fjCep" inputmode="numeric" maxlength="9" placeholder="CEP" aria-label="CEP para calcular frete"><button type="button" class="btn btn-outline-forjha btn-sm" id="fjCalcCep">Calcular</button></div><div id="fjShippingResult"></div>`;
 footer.prepend(box);
 $('#fjCep').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2');
 $('#fjApplyCoupon').onclick=()=>{const c=$('#fjCoupon').value.trim().toUpperCase();const valid={FORJHA10:.10,FORJHA20:.20,PRIMEIRACOMPRA:.15};if(!valid[c]){toast('Cupom inválido');return}localStorage.setItem('forjhaCoupon',c);renderTotals();toast(`${c} aplicado`)};
 $('#fjCalcCep').onclick=async()=>{const cep=$('#fjCep').value.replace(/\D/g,'');if(cep.length!==8){toast('Informe um CEP válido');return}$('#fjShippingResult').innerHTML='<div class="fj-shipping-line"><span>Consultando…</span></div>';try{const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);const d=await r.json();if(d.erro)throw Error();const cost=cep[0]<'3'?18.9:cep[0]<'6'?24.9:29.9;localStorage.setItem('forjhaShipping',JSON.stringify({cep,cost,city:d.localidade,uf:d.uf}));renderTotals()}catch{$('#fjShippingResult').innerHTML='<div class="fj-shipping-line"><span>Não foi possível calcular o frete.</span></div>'}};
 renderTotals();
}
function renderTotals(){
 const box=$('#fjShippingResult');if(!box)return;
 let subtotal=0;try{subtotal=(window.cart||[]).reduce((s,i)=>s+(Number(i.price||0)*(Number(i.qty||1))),0)}catch{}
 const coupon=localStorage.getItem('forjhaCoupon');const rates={FORJHA10:.10,FORJHA20:.20,PRIMEIRACOMPRA:.15};let discount=rates[coupon]?subtotal*rates[coupon]:0;let html='';if(discount)html+=`<div class="fj-discount-line"><span>Desconto (${coupon})</span><strong>- ${money(discount)}</strong></div>`;
 let ship=null;try{ship=JSON.parse(localStorage.getItem('forjhaShipping')||'null')}catch{}
 if(ship)html+=`<div class="fj-shipping-line"><span>Frete ${ship.city}/${ship.uf}</span><strong>${money(ship.cost)}</strong></div>`;
 box.innerHTML=html;
}

// Avaliações locais reais (inseridas pelo usuário)
function openReviewModal(){
 let back=$('#fjReviewModal');if(!back){back=document.createElement('div');back.id='fjReviewModal';back.className='fj-modal-backdrop';back.innerHTML=`<div class="fj-modal"><div class="fj-modal-head"><h4>Avaliar compra</h4><button class="fj-modal-close" aria-label="Fechar">×</button></div><label>Produto</label><select id="fjReviewProduct" class="form-select mb-3"></select><label>Sua nota</label><div class="fj-review-stars mb-3">${[1,2,3,4,5].map(n=>`<button type="button" data-star="${n}" aria-label="${n} estrelas">☆</button>`).join('')}</div><label>Comentário</label><textarea id="fjReviewText" class="form-control mb-3" rows="3" maxlength="300"></textarea><button id="fjSendReview" class="btn btn-primary-forjha">Publicar avaliação</button><div id="fjReviewsList" class="mt-3"></div></div>`;document.body.append(back)}
 const select=$('#fjReviewProduct',back);if(window.DB?.products)select.innerHTML=window.DB.products.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');else if($$('.product-card').length)select.innerHTML=$$('.product-card').map(c=>`<option value="${c.dataset.id||''}">${$('.product-name',c)?.textContent||'Produto FORJHA'}</option>`).join('');
 let rating=5;$$('[data-star]',back).forEach(b=>b.onclick=()=>{rating=Number(b.dataset.star);$$('[data-star]',back).forEach(x=>x.textContent=Number(x.dataset.star)<=rating?'★':'☆')});
 $('#fjSendReview',back).onclick=()=>{const text=$('#fjReviewText',back).value.trim();if(!text){toast('Escreva um comentário');return}const reviews=JSON.parse(localStorage.getItem('forjhaReviews')||'[]');reviews.unshift({product:select.options[select.selectedIndex]?.text||'Produto FORJHA',rating,text,date:new Date().toLocaleDateString('pt-BR'),author:session()?.name||'Cliente'});localStorage.setItem('forjhaReviews',JSON.stringify(reviews));renderReviewList(back);$('#fjReviewText',back).value='';toast('Avaliação publicada')};
 $('.fj-modal-close',back).onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()};renderReviewList(back);
}
function renderReviewList(back){const reviews=JSON.parse(localStorage.getItem('forjhaReviews')||'[]');$('#fjReviewsList',back).innerHTML=reviews.length?reviews.map(r=>`<div class="fj-review-row"><strong>${r.author}</strong> · <span style="color:#ffb347">${'★'.repeat(r.rating)}</span><p class="mb-0 mt-1">${r.text.replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'})[c])}</p></div>`).join(''):'<p class="text-secondary">Nenhuma avaliação publicada.</p>'}

// Produtos relacionados em páginas com modal já existente
function setupRelated(){
 const modal=$('#productModal')||$('#modalProduto');if(!modal)return;
 const content=$('.modal-body',modal)||modal;
 if(!content||$('#fjRelated'))return;
 const box=document.createElement('div');box.id='fjRelated';box.className='fj-related-grid';box.innerHTML=$$('.product-card').slice(0,3).map(c=>{const img=$('img',c)?.src||'';const name=$('.product-name',c)?.textContent||'Produto FORJHA';return `<div class="fj-related-card"><img src="${img}" alt="${name}"><strong>${name}</strong><a href="produto.html">Ver produto</a></div>`}).join('');content.append(box);
}

function init(){setupCartExtras();setupRelated();setupCheckoutHistory();setupProductLinks();renderTotals()}
document.addEventListener('DOMContentLoaded',init);
window.addEventListener('load',()=>setTimeout(init,500));

// Registra pedidos demonstrativos no histórico local ao iniciar o checkout.
function setupCheckoutHistory(){
 document.addEventListener('click',e=>{const btn=e.target.closest('.btn-checkout');if(!btn)return;
  const cart=JSON.parse(localStorage.getItem('forjhaCart')||'[]');if(!cart.length)return;
  const ship=JSON.parse(localStorage.getItem('forjhaShipping')||'null');const total=cart.reduce((s,i)=>s+Number(i.price||0)*Number(i.qty||1),0)+(ship?.cost||0);const orders=JSON.parse(localStorage.getItem('forjhaOrders')||'[]');orders.unshift({id:'#'+Date.now().toString().slice(-6),items:cart.map(i=>i.name).join(', '),total:new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total),status:'Confirmado',date:new Date().toLocaleString('pt-BR')});localStorage.setItem('forjhaOrders',JSON.stringify(orders.slice(0,20)))
 },true);
}

// Adiciona links para páginas individuais aos cards do catálogo
function setupProductLinks(){
 $$('.product-card').forEach((card,index)=>{if(card.querySelector('[data-fj-detail]'))return;const id=Number(card.dataset.id||index+1);const box=$('.product-actions',card)||card;const link=document.createElement('a');link.dataset.fjDetail='1';link.href=`produto.html?id=${id}`;link.className='btn btn-outline-forjha mt-2 w-100';link.innerHTML='<i class="bi bi-eye me-2"></i>Ver detalhes';box.append(link)});
}
setupProductLinks();
})();
