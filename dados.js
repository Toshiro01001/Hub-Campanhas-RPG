/* dados.js · lista das campanhas do menu
   Para mudar um quadro, edite só este arquivo. A ordem dos quadros é a ordem desta lista.
   estado:  'jogar'   → o quadro é um link e abre a campanha (url)
            'enquete' → o quadro abre a página da enquete (url)
            'breve'   → "Em Breve...", sem link nenhum
            'finalizada' → campanha encerrada e sem site: selo "Finalizada", sem link nenhum
   selo / estadoTexto (opcionais): trocam o selo do quadro e a linha de estado do painel
   emBreve (opcional): põe a faixa "Em Breve..." num quadro que JÁ tem site; o link continua funcionando
   botao (opcional): troca o texto do botão do painel (e a dica do 2º toque no celular)
   cor / fundo: cor de destaque e tom do fundo quando o quadro está selecionado
   musica: faixa que toca com o mouse em cima do quadro (ou ao tocar nele no celular); '' para nenhuma
   descricao (opcional): uma frase sobre a campanha, abaixo das linhas de info
   info: linhas do painel (sistema, lugar, ano...), na ordem em que devem aparecer; [] para não mostrar nada */
window.CAMPANHAS = [
  {
    id: 'vestigios',
    musica: 'musica/vestigios.mp3',
    nome: 'Vestígios da Guerra',
    simbolo: 'img/vestigios.svg',
    info: ['Ordem Paranormal', 'Pripyat, URSS', '1986'],
    descricao: 'Uma campanha em que agentes investigavam a cidade de Pripyat meses depois da explosão de Chernobyl.',
    cor: '#c8c24a',
    fundo: '#11130a',
    estado: 'finalizada'
  },
{
    id: 'acf',
    musica: 'musica/acf.mp3',
    nome: 'A Caixa de Fósforos',
    simbolo: 'img/acf.svg',
    info: ['Ordem Paranormal 1', 'Carcosa, MT - Brasil', '2039'],
    cor: '#a35fd0',
    fundo: '#170b22',
    estado: 'jogar',
    url: 'https://toshiro01001.github.io/Planta-ACF/'
  },
{
    id: 'brasas',
    musica: 'musica/brasas.mp3',
    nome: 'A Caixa de Fósforos: Brasas',
    simbolo: 'img/brasas.svg',
    info: ['Ordem Paranormal 2', 'Continuação da Caixa de Fósforos', 'Carcosa/A Baixada/Chapada/Norte, MT - Brasil', '2139'],
    cor: '#ff8c1a',
    fundo: '#1c0d05',
    estado: 'breve'
  },
{
    id: 'crowsrest',
    musica: 'musica/crowsrest.mp3',
    nome: 'Crowsrest',
    simbolo: 'img/crowsrest.svg',
    info: ['Candela Obscura', 'West Virginia', '1997'],
    cor: '#d0453a',
    fundo: '#0d1726',
    estado: 'jogar',
    emBreve: true,
    estadoTexto: 'Em breve...',
    botao: 'Ver o site ▸',
    url: 'https://toshiro01001.github.io/Crowrest/'
  },
{
    id: 'cronicas-lua',
    musica: 'musica/cronicas-lua.mp3',
    nome: 'As Crônicas da Lua',
    simbolo: 'img/lua.svg',
    info: ['D&D5E', 'Thalmyr, Continente humano do planeta Vaarus', '689 D.E.'],
    cor: '#c9d3e6',
    fundo: '#0b1220',
    estado: 'breve'
  },
{
    id: 'ecos-horror',
    musica: 'musica/ecos-horror.mp3',
    nome: 'Ecos do Horror',
    simbolo: 'img/ecos-horror.svg',
    info: ['Sistema em votação', 'Isith, Continente Central de Gaia', '1715'],
    cor: '#d9202b',
    fundo: '#1a0507',
    estado: 'enquete',
    url: 'enquete.html?e=ecos-horror'
  },
{
    id: 'ecos-ruinas',
    musica: 'musica/ecos-ruinas.mp3',
    nome: 'Ecos das Ruínas',
    subtitulo: 'A Trindade',
    simbolo: 'img/trindade.svg',
    info: ['Hunter x Hunter 5e (Homebrew)', 'SATUS', '430 D.T.'],
    cor: '#e8c33a',
    fundo: '#141208',
    estado: 'jogar',
    url: 'https://toshiro01001.github.io/A-Trindade/'
  },
{
    id: 'os-outros',
    musica: 'musica/os-outros.mp3',
    nome: 'Os Outros',
    simbolo: 'img/os-outros.svg',
    info: ['Candela Obscura', 'San Antonio, TX', '2025'],
    cor: '#aab6c3',
    fundo: '#101317',
    estado: 'enquete',
    selo: 'Finalizada',
    estadoTexto: 'Campanha finalizada',
    url: 'enquete.html?e=os-outros'
  }
];
