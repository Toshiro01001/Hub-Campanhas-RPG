/* app.js · menu principal
   - monta os quadros a partir de dados.js
   - passar o mouse / focar um quadro troca a cor do fundo e o painel da direita
   - clique (ou Enter) entra direto na campanha; "Em breve" balança e não leva a lugar nenhum
   - setas do teclado andam pela grade; som opcional (desligado por padrão) */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const LISTA = Array.isArray(window.CAMPANHAS) ? window.CAMPANHAS : [];
  const ls = {
    get(k, p) { try { const v = localStorage.getItem(k); return v === null ? p : JSON.parse(v); } catch (e) { return p; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const SELO = { jogar: 'Jogar', enquete: 'Enquete', breve: '' };
  const ESTADO = { jogar: 'Disponível', enquete: 'Votação aberta', breve: 'Em breve...' };
  const BOTAO = { jogar: 'Jogar ▸', enquete: 'Votar ▸', breve: 'Em breve...' };

  /* ---------- quadros ---------- */
  const grade = $('#grade');
  grade.innerHTML = LISTA.map((c, i) => {
    const comLink = c.estado !== 'breve' && c.url;
    const tag = comLink ? 'a' : 'div';
    const attrs = comLink
      ? `href="${esc(c.url)}"`
      : `role="link" aria-disabled="true" tabindex="0"`;
    const rotulo = c.nome + (c.subtitulo ? ', ' + c.subtitulo : '') + (c.estado === 'breve' ? ' (em breve)' : c.estado === 'enquete' ? ' (enquete)' : '');
    return `<${tag} class="tile ${c.estado === 'breve' ? 'breve' : ''}" data-id="${esc(c.id)}" ${attrs} aria-label="${esc(rotulo)}" style="--tc:${esc(c.cor)};--i:${i}">
      <span class="tile-arte"><img src="${esc(c.simbolo)}" alt="" loading="eager" draggable="false"></span>
      ${c.estado === 'breve' ? '<span class="tile-faixa" aria-hidden="true">Em Breve...</span>' : `<span class="tile-selo" aria-hidden="true">${SELO[c.estado] || ''}</span>`}
      <span class="tile-nome" aria-hidden="true">${esc(c.nome)}</span>
    </${tag}>`;
  }).join('');
  const tiles = [...grade.querySelectorAll('.tile')];
  const porId = id => LISTA.find(c => c.id === id);

  const n = LISTA.filter(c => c.estado === 'jogar').length;
  $('#contagem').textContent = `${LISTA.length} campanhas · ${n} disponíve${n === 1 ? 'l' : 'is'}`;

  /* ---------- som (WebAudio, sem arquivos) ---------- */
  let somOn = ls.get('hub-som', false), ctx = null;
  const btnSom = $('#btnSom');
  const pintarSom = () => { btnSom.innerHTML = (somOn ? '🔊' : '🔇') + '<span class="som-txt"> Som</span>'; btnSom.setAttribute('aria-pressed', String(somOn)); };
  pintarSom();
  btnSom.addEventListener('click', () => { somOn = !somOn; ls.set('hub-som', somOn); pintarSom(); if (somOn) bip('passa'); });
  function bip(tipo) {
    if (!somOn) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      const cfg = { passa: [660, .035, .05, 'triangle'], entra: [440, .09, .22, 'sawtooth'], nega: [140, .07, .2, 'square'] }[tipo];
      o.type = cfg[3]; o.frequency.setValueAtTime(cfg[0], t);
      if (tipo === 'entra') o.frequency.exponentialRampToValueAtTime(880, t + .18);
      if (tipo === 'nega') o.frequency.exponentialRampToValueAtTime(90, t + .18);
      g.gain.setValueAtTime(cfg[1], t); g.gain.exponentialRampToValueAtTime(.0001, t + cfg[2]);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + cfg[2] + .02);
    } catch (e) {}
  }

  /* ---------- seleção: fundo + painel ---------- */
  const det = $('#detalhe'), dBtn = $('#dBtn');
  let atual = null;
  function selecionar(id, comSom) {
    const c = porId(id); if (!c || atual === id) return;
    atual = id; ls.set('hub-ultima', id);
    document.documentElement.style.setProperty('--c', c.cor);
    document.documentElement.style.setProperty('--f', c.fundo);
    tiles.forEach(t => t.classList.toggle('ativa', t.dataset.id === id));
    $('#dImg').src = c.simbolo;
    $('#dEstado').textContent = ESTADO[c.estado] || '';
    $('#dNome').textContent = c.nome;
    $('#dSub').textContent = c.subtitulo || '';
    $('#dInfo').innerHTML = [c.sistema, c.nota].filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('');
    dBtn.textContent = BOTAO[c.estado] || '';
    if (c.estado !== 'breve' && c.url) { dBtn.href = c.url; dBtn.classList.remove('off'); dBtn.removeAttribute('aria-disabled'); dBtn.tabIndex = 0; }
    else { dBtn.removeAttribute('href'); dBtn.classList.add('off'); dBtn.setAttribute('aria-disabled', 'true'); dBtn.tabIndex = -1; }
    det.classList.remove('troca'); void det.offsetWidth; det.classList.add('troca');
    if (comSom) bip('passa');
  }

  const negar = t => { t.classList.remove('nega'); void t.offsetWidth; t.classList.add('nega'); bip('nega'); };

  tiles.forEach(t => {
    t.addEventListener('mouseenter', () => selecionar(t.dataset.id, true));
    t.addEventListener('focus', () => selecionar(t.dataset.id, true));
    t.addEventListener('click', e => {
      const c = porId(t.dataset.id);
      if (c.estado === 'breve') { e.preventDefault(); selecionar(c.id); negar(t); return; }
      bip('entra');
    });
    t.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && t.classList.contains('breve')) { e.preventDefault(); negar(t); }
      if (e.key === ' ' && t.tagName === 'A') { e.preventDefault(); t.click(); }
    });
  });

  /* ---------- setas do teclado ---------- */
  const colunas = () => getComputedStyle(grade).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  document.addEventListener('keydown', e => {
    const mapa = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -colunas(), ArrowDown: colunas() };
    if (!(e.key in mapa) || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    let i = tiles.findIndex(t => t.dataset.id === atual);
    if (!tiles.includes(document.activeElement) && i >= 0) { tiles[i].focus(); return; }
    i = Math.max(0, Math.min(tiles.length - 1, (i < 0 ? 0 : i + mapa[e.key])));
    tiles[i].focus();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement === document.body && atual) {
      const t = tiles.find(x => x.dataset.id === atual); if (t) t.click();
    }
  });

  /* ---------- começo: última campanha vista (ou a primeira disponível) ---------- */
  const ult = ls.get('hub-ultima', null);
  selecionar(porId(ult) ? ult : (LISTA.find(c => c.estado === 'jogar') || LISTA[0] || {}).id);
})();
