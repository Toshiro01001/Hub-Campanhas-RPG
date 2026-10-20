/* app.js · menu principal
   - monta os quadros a partir de dados.js
   - passar o mouse / focar um quadro troca a cor do fundo, o painel da direita e toca a música da campanha
   - computador: clique (ou Enter) entra direto; a música toca enquanto o mouse está em cima do quadro
   - celular: 1º toque seleciona e toca a música; 2º toque no mesmo quadro entra
   - "Em breve" e "Finalizada" (sem site) balançam e não levam a lugar nenhum
   - abertura "Pressione qualquer tecla": o navegador só deixa tocar som depois de um clique/tecla/toque
   - botão 🔊/🔇 liga e desliga tudo (lembrado neste aparelho) */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const LISTA = Array.isArray(window.CAMPANHAS) ? window.CAMPANHAS : [];
  const ls = {
    get(k, p) { try { const v = localStorage.getItem(k); return v === null ? p : JSON.parse(v); } catch (e) { return p; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TOQUE = window.matchMedia('(hover: none)').matches;

  const SELO = { jogar: 'Jogar', enquete: 'Enquete', breve: '', finalizada: 'Finalizada' };
  const ESTADO = { jogar: 'Disponível', enquete: 'Votação aberta', breve: 'Em breve...', finalizada: 'Campanha finalizada' };
  const BOTAO = { jogar: 'Jogar ▸', enquete: 'Votar ▸', breve: 'Em breve...', finalizada: 'Campanha finalizada' };
  const DICA = { jogar: 'Toque de novo para jogar ▸', enquete: 'Toque de novo para votar ▸', breve: 'Em breve...', finalizada: 'Campanha finalizada' };
  // só 'jogar' e 'enquete' viram link; 'breve' e 'finalizada' não levam a lugar nenhum
  const temLink = c => (c.estado === 'jogar' || c.estado === 'enquete') && !!c.url;

  const infoDe = c => (Array.isArray(c.info) ? c.info : [c.sistema, c.nota]).filter(Boolean);
  // deixa a linha quebrar depois de cada "/" (Carcosa/A Baixada/...) em vez de partir uma palavra no meio
  const linha = t => esc(t).replace(/\//g, '/<wbr>');

  /* ---------- quadros ---------- */
  const grade = $('#grade');
  grade.innerHTML = LISTA.map((c, i) => {
    const comLink = temLink(c);
    const tag = comLink ? 'a' : 'div';
    const attrs = comLink
      ? `href="${esc(c.url)}"`
      : `role="link" aria-disabled="true" tabindex="0"`;
    const rotulo = c.nome + (c.subtitulo ? ', ' + c.subtitulo : '') + (c.estado === 'breve' ? ' (em breve)' : c.estado === 'finalizada' ? ' (campanha finalizada)' : c.estado === 'enquete' ? ` (${c.estadoTexto ? c.estadoTexto.toLowerCase() + ', ' : ''}enquete)` : '');
    return `<${tag} class="tile ${c.estado === 'breve' ? 'breve' : ''} ${comLink ? '' : 'sem-link'}" data-id="${esc(c.id)}" ${attrs} aria-label="${esc(rotulo)}" style="--tc:${esc(c.cor)};--i:${i}">
      <span class="tile-arte"><img src="${esc(c.simbolo)}" alt="" loading="eager" draggable="false">${c.estado === 'breve' ? '<span class="tile-faixa" aria-hidden="true">Em Breve...</span>' : ''}</span>
      ${c.estado === 'breve' ? '' : `<span class="tile-selo" aria-hidden="true">${esc(c.selo || SELO[c.estado] || '')}</span>`}
      <span class="tile-nome" aria-hidden="true">${esc(c.nome)}</span>
      ${infoDe(c).length ? `<span class="tile-info">${infoDe(c).map(t => `<span>${linha(t)}</span>`).join('')}</span>` : ''}
      ${c.descricao ? `<span class="tile-desc">${esc(c.descricao)}</span>` : ''}
      ${c.musica ? '<i class="tile-eq" aria-hidden="true"><b></b><b></b><b></b></i>' : ''}
      <span class="tile-dica" aria-hidden="true">${esc(DICA[c.estado] || '')}</span>
    </${tag}>`;
  }).join('');
  const tiles = [...grade.querySelectorAll('.tile')];
  const porId = id => LISTA.find(c => c.id === id);
  const tileDe = id => tiles.find(t => t.dataset.id === id);

  const n = LISTA.filter(c => c.estado === 'jogar').length;
  $('#contagem').textContent = `${LISTA.length} campanhas · ${n} disponíve${n === 1 ? 'l' : 'is'}`;

  /* ---------- áudio: um AudioContext para os bips e para as músicas ---------- */
  let somOn = ls.get('hub-som', true), ctx = null, liberado = false;
  const AC = window.AudioContext || window.webkitAudioContext;
  const pegarCtx = () => {
    if (!AC) return null;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  function bip(tipo) {
    if (!somOn || !liberado) return;
    try {
      const x = pegarCtx(); if (!x) return;
      const o = x.createOscillator(), g = x.createGain(), t = x.currentTime;
      const cfg = { passa: [660, .02, .05, 'triangle'], entra: [440, .06, .22, 'sawtooth'], nega: [140, .05, .2, 'square'] }[tipo];
      o.type = cfg[3]; o.frequency.setValueAtTime(cfg[0], t);
      if (tipo === 'entra') o.frequency.exponentialRampToValueAtTime(880, t + .18);
      if (tipo === 'nega') o.frequency.exponentialRampToValueAtTime(90, t + .18);
      g.gain.setValueAtTime(cfg[1], t); g.gain.exponentialRampToValueAtTime(.0001, t + cfg[2]);
      o.connect(g).connect(x.destination); o.start(t); o.stop(t + cfg[2] + .02);
    } catch (e) {}
  }

  /* ---------- músicas: cada campanha tem a sua; troca com fade e continua de onde parou ---------- */
  const VOLUME = 0.6, SUBIR = 0.9, DESCER = 0.6;
  const faixas = {};          // id -> { a: <audio>, g: GainNode|null, pausa: timer }
  let tocando = null, timerParar = null;

  function faixa(id) {
    if (faixas[id]) return faixas[id];
    const c = porId(id); if (!c || !c.musica) return null;
    const a = new Audio();
    a.src = c.musica; a.loop = true; a.preload = 'none';
    let g = null;
    const x = pegarCtx();
    if (x) {
      // o volume passa por um GainNode porque no iPhone o audio.volume é ignorado (o fade não funcionaria)
      try { const src = x.createMediaElementSource(a); g = x.createGain(); g.gain.value = 0; src.connect(g).connect(x.destination); } catch (e) { g = null; }
    }
    if (!g) a.volume = 0;
    return (faixas[id] = { a, g, pausa: null });
  }

  function rampa(f, alvo, seg) {
    if (f.g && ctx) {
      const t = ctx.currentTime, p = f.g.gain;
      p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(alvo, t + seg);
    } else {
      // reserva sem Web Audio: anima o volume do próprio <audio>
      clearInterval(f.anim);
      const ini = f.a.volume, passos = Math.max(1, Math.round(seg * 30)); let k = 0;
      f.anim = setInterval(() => { k++; f.a.volume = Math.min(1, Math.max(0, ini + (alvo - ini) * k / passos)); if (k >= passos) clearInterval(f.anim); }, 1000 / 30);
    }
  }

  function descer(id) {
    const f = faixas[id]; if (!f) return;
    rampa(f, 0, DESCER);
    clearTimeout(f.pausa);
    f.pausa = setTimeout(() => { if (tocando !== id) f.a.pause(); }, DESCER * 1000 + 120);
  }

  function tocar(id) {
    clearTimeout(timerParar);
    if (!somOn || !liberado) return;
    const f = faixa(id);
    if (!f) { pararMusica(0); return; }
    if (tocando && tocando !== id) descer(tocando);
    tocando = id;
    clearTimeout(f.pausa);
    pegarCtx();
    const p = f.a.play();
    if (p && p.catch) p.catch(() => {});
    rampa(f, VOLUME, SUBIR);
    marcarTocando();
  }

  function pararMusica(atraso) {
    clearTimeout(timerParar);
    timerParar = setTimeout(() => { if (tocando) { descer(tocando); tocando = null; marcarTocando(); } }, atraso || 0);
  }

  const marcarTocando = () => tiles.forEach(t => t.classList.toggle('tocando', t.dataset.id === tocando));

  /* ---------- botão de som ---------- */
  const btnSom = $('#btnSom');
  const pintarSom = () => { btnSom.innerHTML = (somOn ? '🔊' : '🔇') + '<span class="som-txt"> Som</span>'; btnSom.setAttribute('aria-pressed', String(somOn)); };
  pintarSom();
  btnSom.addEventListener('click', () => {
    somOn = !somOn; ls.set('hub-som', somOn); pintarSom();
    if (somOn) { liberar(); bip('passa'); if (TOQUE && armado) tocar(armado); }
    else pararMusica(0);
  });

  /* ---------- abertura: "Pressione qualquer tecla" (destrava o som do navegador) ---------- */
  const abertura = $('#abertura');
  let mouseX = -1, mouseY = -1;
  document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mouseX = e.clientX; mouseY = e.clientY; } }, { passive: true });

  function liberar() {
    if (liberado) return;
    liberado = true;
    pegarCtx();
    // no computador, "destrava" cada música dentro do gesto (o Safari exige isso para tocar depois só com o mouse em cima)
    if (!TOQUE && somOn) LISTA.forEach(c => {
      const f = faixa(c.id); if (!f) return;
      f.a.preload = 'auto';
      const p = f.a.play(); if (p && p.then) p.then(() => { if (tocando !== c.id) f.a.pause(); }).catch(() => {});
    });
  }

  function fecharAbertura(semSom) {
    if (!abertura || abertura.hidden) return;
    if (semSom) { somOn = false; ls.set('hub-som', false); pintarSom(); }
    liberar();
    abertura.classList.add('saindo');
    setTimeout(() => { abertura.hidden = true; abertura.classList.remove('saindo'); }, 420);
    // se o mouse já está em cima de um quadro, a música dele começa na hora
    if (mouseX >= 0) {
      const t = document.elementFromPoint(mouseX, mouseY);
      const q = t && t.closest && t.closest('.tile');
      if (q) { selecionar(q.dataset.id); tocar(q.dataset.id); }
    }
  }

  function mostrarAbertura() {
    if (!abertura) return;
    if (!somOn) { liberado = true; return; } // sem som não há o que destravar: entra direto
    $('#aberturaTexto').textContent = TOQUE ? 'Toque para começar' : 'Pressione qualquer tecla';
    abertura.hidden = false;
  }

  if (abertura) {
    abertura.addEventListener('click', e => { e.preventDefault(); fecharAbertura(!!e.target.closest('#aberturaMudo')); });
    window.addEventListener('keydown', e => {
      if (abertura.hidden) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(e.key)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      fecharAbertura(false);
    }, true);
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
    $('#dEstado').textContent = c.estadoTexto || ESTADO[c.estado] || '';
    $('#dNome').textContent = c.nome;
    $('#dSub').textContent = c.subtitulo || '';
    $('#dInfo').innerHTML = infoDe(c).map(t => `<li>${linha(t)}</li>`).join('');
    $('#dDesc').textContent = c.descricao || '';
    dBtn.textContent = BOTAO[c.estado] || '';
    if (temLink(c)) { dBtn.href = c.url; dBtn.classList.remove('off'); dBtn.removeAttribute('aria-disabled'); dBtn.tabIndex = 0; }
    else { dBtn.removeAttribute('href'); dBtn.classList.add('off'); dBtn.setAttribute('aria-disabled', 'true'); dBtn.tabIndex = -1; }
    det.classList.remove('troca'); void det.offsetWidth; det.classList.add('troca');
    if (comSom) bip('passa');
  }

  const negar = t => { t.classList.remove('nega'); void t.offsetWidth; t.classList.add('nega'); bip('nega'); };

  /* ---------- celular: 1º toque arma (seleciona + música), 2º toque entra ---------- */
  let armado = null, ultimoPonteiro = 'mouse';
  document.addEventListener('pointerdown', e => { ultimoPonteiro = e.pointerType || 'mouse'; }, true);
  const desarmar = () => { armado = null; tiles.forEach(t => t.classList.remove('armada')); };

  tiles.forEach(t => {
    const id = t.dataset.id;
    // mouse: entrou no quadro = seleciona e toca; saiu = a música para (com uma folga para passar de um quadro ao outro)
    t.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; selecionar(id, true); tocar(id); });
    t.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; pararMusica(260); });
    // teclado (Tab/setas): o foco faz o mesmo papel do mouse
    t.addEventListener('focus', () => { if (ultimoPonteiro !== 'mouse' && ultimoPonteiro !== 'teclado') return; selecionar(id, true); if (ultimoPonteiro === 'teclado') tocar(id); });
    t.addEventListener('blur', () => { if (ultimoPonteiro === 'teclado') pararMusica(260); });
    t.addEventListener('click', e => {
      const c = porId(id);
      const porToque = ultimoPonteiro === 'touch' || ultimoPonteiro === 'pen';
      if (porToque && armado !== id) {
        e.preventDefault();
        desarmar(); armado = id; t.classList.add('armada');
        selecionar(id); liberado = true; tocar(id);
        return;
      }
      if (!temLink(c)) { e.preventDefault(); selecionar(c.id); negar(t); return; }
      bip('entra');
    });
    t.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && t.classList.contains('sem-link')) { e.preventDefault(); negar(t); }
      if (e.key === ' ' && t.tagName === 'A') { e.preventDefault(); t.click(); }
    });
  });

  // celular: tocar fora dos quadros desarma e para a música
  document.addEventListener('click', e => {
    if (!armado || e.target.closest('.tile') || e.target.closest('#btnSom')) return;
    desarmar(); pararMusica(0);
  });

  // computador: com o mouse em cima do painel da direita, a música do quadro selecionado continua
  det.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && atual) tocar(atual); });
  det.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pararMusica(260); });

  /* ---------- setas do teclado ---------- */
  const colunas = () => getComputedStyle(grade).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  document.addEventListener('keydown', e => {
    ultimoPonteiro = 'teclado';
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
      const t = tileDe(atual); if (t) t.click();
    }
  });

  /* ---------- aba escondida / volta pelo botão "voltar" ---------- */
  document.addEventListener('visibilitychange', () => { if (document.hidden) { Object.values(faixas).forEach(f => f.a.pause()); tocando = null; marcarTocando(); } });
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    // voltou de uma campanha pelo "voltar": o navegador bloqueia o som de novo até o próximo gesto
    desarmar(); liberado = false; mostrarAbertura();
  });

  // consulta para depuração (console do navegador): hubMusica() mostra o que está tocando
  window.hubMusica = () => ({ tocando, liberado, somOn, faixas: Object.fromEntries(Object.entries(faixas).map(([k, f]) => [k, { pausada: f.a.paused, tempo: +f.a.currentTime.toFixed(1), ganho: f.g ? +f.g.gain.value.toFixed(2) : +f.a.volume.toFixed(2) }])) });

  /* ---------- começo: última campanha vista (ou a primeira disponível) ---------- */
  const ult = ls.get('hub-ultima', null);
  selecionar(porId(ult) ? ult : (LISTA.find(c => c.estado === 'jogar') || LISTA[0] || {}).id);
  mostrarAbertura();
})();
