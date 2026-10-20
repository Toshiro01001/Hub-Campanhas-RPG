/* enquete.js · enquete de Ecos do Horror
   - com Firebase (config.js preenchido): login anônimo, 1 voto por aparelho/navegador, pode mudar o voto,
     resultado ao vivo para quem já votou
   - sem Firebase (config.js = null): modo local, o voto fica só neste aparelho */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const CAMINHO = 'hub/enquetes/ecosDoHorror/votos';
  const CHAVE_LOCAL = 'hub-enquete-ecosDoHorror';
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const OPC = {
    sistema: [['tormenta', 'Tormenta'], ['dnd5e', 'D&D5E'], ['op2', 'Ordem Paranormal 2'], ['candela', 'Candela Obscura']],
    reboot: [['sim', 'Sim'], ['nao', 'Não']]
  };
  const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, p) { try { const v = localStorage.getItem(k); return v === null ? p : JSON.parse(v); } catch (e) { return p; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  const form = $('#form'), btn = $('#btnVotar'), aviso = $('#aviso'), modo = $('#modo'), res = $('#resultado');
  let votos = {}, meuUid = null, ref = null, pronto = false;

  const escolha = nome => { const i = form.querySelector(`input[name="${nome}"]:checked`); return i ? i.value : null; };
  const validar = () => {
    const ok = pronto && !!escolha('sistema') && !!escolha('reboot');
    btn.disabled = !ok;
    if (pronto) aviso.textContent = ok ? '' : 'Escolha uma opção em cada pergunta.';
  };
  form.addEventListener('change', validar);

  function preencher(v) {
    if (!v) return;
    ['sistema', 'reboot'].forEach(k => { const i = form.querySelector(`input[name="${k}"][value="${v[k]}"]`); if (i) i.checked = true; });
    $('#nome').value = v.nome || '';
    validar();
  }

  function barras(alvo, lista, campo, meu) {
    const todos = Object.values(votos);
    const total = todos.length || 0;
    alvo.innerHTML = lista.map(([v, rot]) => {
      const q = todos.filter(x => x && x[campo] === v).length;
      const pct = total ? Math.round(q / total * 100) : 0;
      return `<div class="barra"><div class="barra-topo"><b class="${meu && meu[campo] === v ? 'meu' : ''}">${esc(rot)}</b><span>${q} · ${pct}%</span></div>
        <div class="barra-fundo"><div class="barra-cheia" data-w="${pct}"></div></div></div>`;
    }).join('');
    requestAnimationFrame(() => alvo.querySelectorAll('.barra-cheia').forEach(b => { b.style.width = b.dataset.w + '%'; }));
  }

  function mostrarResultado() {
    const meu = meuUid ? votos[meuUid] : null;
    if (!meu) { res.hidden = true; form.hidden = false; return; }
    form.hidden = true; res.hidden = false;
    barras($('#resSistema'), OPC.sistema, 'sistema', meu);
    barras($('#resReboot'), OPC.reboot, 'reboot', meu);
    const total = Object.keys(votos).length;
    $('#resTotal').textContent = `${total} voto${total === 1 ? '' : 's'} no total.`;
    const nomes = Object.values(votos).map(v => v && v.nome).filter(Boolean);
    const anon = total - nomes.length;
    $('#resNomes').textContent = nomes.length || anon
      ? 'Já votaram: ' + [...nomes.map(String), ...(anon ? [`${anon} sem nome`] : [])].join(', ') + '.'
      : '';
  }

  $('#btnMudar').addEventListener('click', () => {
    res.hidden = true; form.hidden = false; preencher(meuUid ? votos[meuUid] : null);
    form.querySelector('input[name="sistema"]:checked, input[name="sistema"]').focus();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const sistema = escolha('sistema'), reboot = escolha('reboot');
    if (!sistema || !reboot || !pronto) { validar(); return; }
    const nome = $('#nome').value.trim().replace(/\s+/g, ' ').slice(0, 40);
    const voto = { sistema, reboot, ts: Date.now() };
    if (nome) voto.nome = nome;
    btn.disabled = true; aviso.textContent = 'Enviando…';
    try {
      if (ref) await ref.child(meuUid).set(voto);
      else { votos = { local: voto }; ls.set(CHAVE_LOCAL, voto); }
      aviso.textContent = '';
      mostrarResultado();
    } catch (err) {
      console.error(err);
      aviso.textContent = 'Não consegui registrar o voto. Confira a conexão e tente de novo.';
      validar();
    }
  });

  /* ---------- modo local ---------- */
  function modoLocal() {
    meuUid = 'local';
    const v = ls.get(CHAVE_LOCAL, null);
    votos = v ? { local: v } : {};
    modo.textContent = 'Modo local: o Firebase ainda não foi configurado, então o voto fica salvo só neste aparelho e o resultado mostra apenas ele.';
    pronto = true; preencher(v); validar(); mostrarResultado();
  }

  /* ---------- modo Firebase ---------- */
  const carregar = src => new Promise((ok, falha) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => falha(new Error('script ' + src)); document.head.appendChild(s); });
  async function modoFirebase(cfg) {
    modo.textContent = 'Conectando…';
    try {
      await carregar(SDK + 'firebase-app-compat.js');
      await Promise.all([carregar(SDK + 'firebase-auth-compat.js'), carregar(SDK + 'firebase-database-compat.js')]);
      const app = firebase.initializeApp(cfg, 'hub');
      const auth = app.auth(), db = app.database();
      const user = auth.currentUser || (await auth.signInAnonymously()).user;
      meuUid = user.uid;
      ref = db.ref(CAMINHO);
      let primeiro = true;
      ref.on('value', snap => {
        votos = snap.val() || {};
        if (primeiro) {
          // primeira leitura: quem já votou cai direto no resultado
          primeiro = false; pronto = true; modo.textContent = '';
          preencher(votos[meuUid]); validar(); mostrarResultado();
        } else if (!res.hidden) {
          mostrarResultado(); // resultado ao vivo enquanto a pessoa olha
        }
      }, err => {
        console.error(err);
        modo.classList.add('erro');
        modo.textContent = 'Sem permissão para ler a enquete. Confira as regras do Firebase (README).';
      });
    } catch (err) {
      console.error(err);
      modo.classList.add('erro');
      modo.textContent = 'Não consegui conectar ao Firebase (o login anônimo está ativado no projeto?). Tente recarregar a página.';
    }
  }

  const cfg = window.HUB_FIREBASE;
  if (cfg && cfg.apiKey && cfg.databaseURL) modoFirebase(cfg); else modoLocal();
})();
