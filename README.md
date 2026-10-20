# Menu de Campanhas de RPG

Site estático (GitHub Pages) que funciona como o "menu principal" das campanhas: cada campanha é um quadro com nome e símbolo. Clicou, entrou.

## Como funciona

- **index.html + app.js**: monta os quadros a partir de `dados.js`.
  - Passar o mouse (ou focar com Tab/setas) num quadro troca a cor do fundo e o painel da direita (computador).
  - No celular não há painel: os quadros ficam em 2 colunas e o toque entra direto.
  - Setas do teclado andam pela grade; Enter entra.
  - Quadros "Em breve" não têm link nenhum (são `div`, não `a`): ao clicar, só balançam.
  - Som do menu: botão 🔇/🔊 no topo, desligado por padrão, gerado pelo navegador (sem arquivos de áudio).
  - O site lembra a última campanha selecionada neste aparelho (`localStorage`, chave `hub-ultima`).
- **dados.js**: a lista das campanhas. Para trocar nome, cor, link, estado ou as linhas de informação (`info`: sistema, lugar, ano), edite só ele.
  - No computador as linhas de `info` aparecem no painel da direita; no celular e no tablet, dentro do próprio quadro.
  - `estado: 'jogar'` abre `url`; `'enquete'` abre a página da enquete; `'breve'` mostra "Em Breve..." sem link.
  - Quando Brasas, As Crônicas da Lua ou Os Outros ficarem prontas: troque `estado` para `'jogar'` e acrescente `url`.
- **enquete.html + enquete.js**: uma página só para todas as enquetes; o `?e=` do endereço escolhe qual abre.
  - `enquete.html?e=ecos-horror`: Ecos do Horror (sistema de RPG e reboot). Sem `?e=`, abre esta.
  - `enquete.html?e=os-outros`: Os Outros, campanha finalizada (querem uma continuação?).
  - Nova enquete: um item em `ENQUETES` (enquete.js) + o bloco dela em `regras-firebase-hub.json`.
  - Com Firebase configurado: login anônimo, um voto por navegador, dá para mudar o voto, resultado ao vivo depois de votar.
  - Sem Firebase (`config.js` com `null`): modo local, o voto fica só no aparelho de quem votou.
- **img/**: símbolos em SVG (`acf.svg` é o Sigilo do Eco; `crowsrest.svg` é o selo do Xerife; os demais são novos).

## Configurar o Firebase da enquete

1. Firebase Console → criar projeto (sugestão: `hub-rpg`; separado de Crowsrest e da Planta).
2. Build → Realtime Database → criar banco.
3. Aba Regras → colar o conteúdo de `regras-firebase-hub.json` → Publicar.
4. Build → Authentication → Sign-in method → ativar **Anônimo**.
5. Authentication → Settings → Domínios autorizados → adicionar `toshiro01001.github.io`.
6. Configurações do projeto → Seus apps → app Web → copiar o `firebaseConfig` para `config.js` (precisa ter `databaseURL`).

Para zerar uma enquete: Realtime Database → apagar o nó `hub/enquetes/ecosDoHorror/votos` ou `hub/enquetes/osOutros/votos`.

## Limites conhecidos

- "Um voto por navegador": quem abrir em aba anônima ou em outro aparelho vota de novo. O nome é declarado pela própria pessoa.
- As fontes vêm do Google Fonts; sem internet, o site usa fontes do sistema.
