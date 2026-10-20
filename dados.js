/* dados.js · lista das campanhas do menu
   Para mudar um quadro, edite só este arquivo.
   estado:  'jogar'   → o quadro é um link e abre a campanha (url)
            'enquete' → o quadro abre a página da enquete (url)
            'breve'   → "Em Breve...", sem link nenhum
   selo / estadoTexto (opcionais): trocam o selo do quadro e a linha de estado do painel
   cor / fundo: cor de destaque e tom do fundo quando o quadro está selecionado
   sistema / nota: textos curtos do painel (deixe '' para não mostrar nada) */
window.CAMPANHAS = [
  {
    id: 'acf',
    nome: 'A Caixa de Fósforos',
    simbolo: 'img/acf.svg',
    sistema: 'Ordem Paranormal',
    nota: '',
    cor: '#a35fd0',
    fundo: '#170b22',
    estado: 'jogar',
    url: 'https://toshiro01001.github.io/Planta-ACF/'
  },
  {
    id: 'crowsrest',
    nome: 'Crowsrest',
    simbolo: 'img/crowsrest.svg',
    sistema: 'Candela Obscura',
    nota: 'West Virginia, 1997',
    cor: '#d0453a',
    fundo: '#0d1726',
    estado: 'jogar',
    url: 'https://toshiro01001.github.io/Crowrest/'
  },
  {
    id: 'cronicas-lua',
    nome: 'As Crônicas da Lua',
    simbolo: 'img/lua.svg',
    sistema: 'D&D 5e',
    nota: '',
    cor: '#c9d3e6',
    fundo: '#0b1220',
    estado: 'breve'
  },
  {
    id: 'ecos-horror',
    nome: 'Ecos do Horror',
    simbolo: 'img/ecos-horror.svg',
    sistema: 'Sistema em votação',
    nota: 'Enquete aberta',
    cor: '#d9202b',
    fundo: '#1a0507',
    estado: 'enquete',
    url: 'enquete.html?e=ecos-horror'
  },
  {
    id: 'ecos-ruinas',
    nome: 'Ecos das Ruínas',
    subtitulo: 'A Trindade',
    simbolo: 'img/trindade.svg',
    sistema: 'Hunter x Hunter 5e (homebrew)',
    nota: '',
    cor: '#e8c33a',
    fundo: '#141208',
    estado: 'jogar',
    url: 'https://toshiro01001.github.io/A-Trindade/'
  },
  {
    id: 'os-outros',
    nome: 'Os Outros',
    simbolo: 'img/os-outros.svg',
    sistema: '',
    nota: 'Enquete: querem uma continuação?',
    cor: '#aab6c3',
    fundo: '#101317',
    estado: 'enquete',
    selo: 'Finalizada',
    estadoTexto: 'Campanha finalizada',
    url: 'enquete.html?e=os-outros'
  },
  {
    id: 'brasas',
    nome: 'A Caixa de Fósforos: Brasas',
    simbolo: 'img/brasas.svg',
    sistema: 'Ordem Paranormal',
    nota: 'Continuação de A Caixa de Fósforos',
    cor: '#ff8c1a',
    fundo: '#1c0d05',
    estado: 'breve'
  }
];
