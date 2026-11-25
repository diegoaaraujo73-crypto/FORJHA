/* FORJHA 4.0 — recursos demonstrativos 100% front-end */
(() => {
  'use strict';
  const money = value => Number(value || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const readIds = key => { try { return JSON.parse(localStorage.getItem(key) || '[]').map(Number); } catch { return []; } };
  let compareItems = readIds('forjhaCompare');
  window.compareItems = compareItems;

  const saveCompare = () => {
    localStorage.setItem('forjhaCompare', JSON.stringify(compareItems));
    window.compareItems = compareItems;
    renderCompare();
    document.querySelectorAll('.product-compare').forEach(btn => {
      const match = (btn.getAttribute('onclick') || '').match(/toggleCompare\((\d+)/);
      if (match) {
        const active = compareItems.includes(Number(match[1]));
        btn.classList.toggle('is-selected',active);
        btn.setAttribute('aria-pressed',String(active));
      }
    });
  };
  window.toggleCompare = (id,event) => {
    event?.stopPropagation(); id=Number(id);
    if(compareItems.includes(id)) compareItems=compareItems.filter(x=>x!==id);
    else if(compareItems.length>=3) { window.showToast?.('Compare até 3 produtos por vez.'); return; }
    else compareItems.push(id);
    saveCompare();
    window.showToast?.(compareItems.includes(id)?'Produto adicionado à comparação.':'Produto removido da comparação.');
  };
  const ensureCompareUI = () => {
    if(document.getElementById('compareDock')) return;
    const dock=document.createElement('aside');
    dock.id='compareDock'; dock.className='compare-dock';
    dock.innerHTML=`<div class="compare-dock-copy"><strong><i class="bi bi-arrow-left-right me-2"></i>Comparar produtos</strong><span id="compareDockCount">0 de 3 selecionados</span></div><div class="compare-dock-actions"><button type="button" class="compare-open" id="openCompare" disabled>Comparar agora</button><button type="button" class="compare-clear" id="clearCompare" aria-label="Limpar comparação"><i class="bi bi-x-lg"></i></button></div>`;
    document.body.appendChild(dock);
    const modal=document.createElement('div');
    modal.id='compareModal'; modal.className='forjha-overlay'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="forjha-dialog compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compareTitle"><button class="forjha-dialog-close" type="button" aria-label="Fechar"><i class="bi bi-x-lg"></i></button><p class="section-sub">DECIDA COM CONFIANÇA</p><h2 id="compareTitle">Comparar <span class="accent">produtos</span></h2><div id="compareContent"></div></div>`;
    document.body.appendChild(modal);
    dock.querySelector('#openCompare').addEventListener('click',()=>{renderCompareTable();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('forjha-modal-open');});
    dock.querySelector('#clearCompare').addEventListener('click',()=>{compareItems=[];saveCompare();});
    modal.querySelector('.forjha-dialog-close').addEventListener('click',closeCompare);
    modal.addEventListener('click',e=>{if(e.target===modal)closeCompare();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCompare();});
  };
  function closeCompare(){const m=document.getElementById('compareModal');if(m){m.classList.remove('is-open');m.setAttribute('aria-hidden','true');document.body.classList.remove('forjha-modal-open');}}
  function renderCompare(){
    const dock=document.getElementById('compareDock'); if(!dock)return;
    dock.querySelector('#compareDockCount').textContent=`${compareItems.length} de 3 selecionados`;
    dock.querySelector('#openCompare').disabled=compareItems.length<2;
    dock.classList.toggle('is-visible',compareItems.length>0);
  }
  function renderCompareTable(){
    const content=document.getElementById('compareContent');
    const products=compareItems.map(id=>DB.products.find(p=>Number(p.id)===id)).filter(Boolean);
    if(!products.length){content.innerHTML='<p>Nenhum produto selecionado.</p>';return;}
    content.innerHTML=`<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Característica</th>${products.map(p=>`<th><img src="${getProductImages(p)[0]||''}" alt=""><strong>${p.name}</strong></th>`).join('')}</tr></thead><tbody><tr><th>Preço</th>${products.map(p=>`<td>${money(p.price)}</td>`).join('')}</tr><tr><th>Categoria</th>${products.map(p=>`<td>${catLabel(p.cat)}</td>`).join('')}</tr><tr><th>Avaliação</th>${products.map(p=>`<td><span class="compare-rating">★ ${Number(p.rating||0).toFixed(1)}</span><small>(${p.reviews||0} avaliações)</small></td>`).join('')}</tr><tr><th>Disponibilidade</th>${products.map(p=>`<td>${Number(p.stock)>0?'Disponível':'Consulte disponibilidade'}</td>`).join('')}</tr><tr><th></th>${products.map(p=>`<td><button class="btn btn-add" onclick="addToCart(${p.id});document.getElementById('compareModal').classList.remove('is-open')">Adicionar ao carrinho</button></td>`).join('')}</tr></tbody></table></div>`;
  }
  function setupKit(){
    const choices=[['kitClothing','roupas'],['kitSupplement','suplementos'],['kitAccessory','acessorios']];
    choices.forEach(([id,cat])=>{
      const select=document.getElementById(id); if(!select)return;
      DB.products.filter(p=>p.cat===cat).forEach(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=`${p.name} · ${money(p.price)}`;select.appendChild(option);});
    });
    const selected=()=>choices.map(([id])=>Number(document.getElementById(id)?.value)).filter(Boolean).map(id=>DB.products.find(p=>Number(p.id)===id)).filter(Boolean);
    const update=()=>{
      const products=selected(),total=products.reduce((sum,p)=>sum+Number(p.price||0),0);
      document.getElementById('kitTotal').textContent=money(total);
      document.getElementById('kitItemCount').textContent=`${products.length} ${products.length===1?'produto selecionado':'produtos selecionados'}`;
      document.getElementById('addKitToCart').disabled=!products.length;
      document.getElementById('kitSelectedList').innerHTML=products.length?products.map(p=>`<span class="kit-chip"><i class="bi bi-check-circle-fill"></i>${p.name}</span>`).join(''):'<i class="bi bi-info-circle me-2"></i>Selecione produtos para montar sua combinação.';
    };
    choices.forEach(([id])=>document.getElementById(id)?.addEventListener('change',update));
    document.getElementById('clearKit')?.addEventListener('click',()=>{choices.forEach(([id])=>{document.getElementById(id).value='';});update();});
    document.getElementById('addKitToCart')?.addEventListener('click',()=>{
      const products=selected(); if(!products.length)return;
      products.forEach(p=>window.addToCart?.(p.id));
      window.showToast?.('Sua combinação foi adicionada ao carrinho!');
    });
    update();
  }
  document.addEventListener('DOMContentLoaded',()=>{ensureCompareUI();setupKit();saveCompare();});
})();
