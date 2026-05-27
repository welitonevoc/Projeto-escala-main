import type { DiaSemana, EscalaLocalItem, Congregacao, Obreiro, TipoCulto, RegraCulto, Departamento } from './types';

export function criarDepartamentoVazio(tipo: string, nome: string): Departamento {
  return {
    id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
    tipo,
    nome,
    dataCriacao: '',
    dirigente: '',
    viceDirigente: '',
    secretaria: '',
    viceSecretaria: ''
  };
}

export const TIPOS_DEPARTAMENTO = [
  { id: 'ebd', label: 'EBD', icon: '📖', cor: 'bg-green-600' },
  { id: 'campanha', label: 'Campanha', icon: '🙏', cor: 'bg-purple-600' },
  { id: 'co', label: 'C.O', icon: '📋', cor: 'bg-blue-600' },
  { id: 'coi', label: 'C.O.I', icon: '🕯️', cor: 'bg-amber-600' },
  { id: 'musical', label: 'Musical', icon: '🎵', cor: 'bg-rose-600' },
];

export const DIAS_OFFSET: Record<string, number> = {
  segunda: 0, terca: 1, quarta: 2, quintaManha: 3, quintaTarde: 3, quintaNoite: 3,
  sexta: 4, sabado: 5, domingoManha: 6, domingoNoite: 6
};

export const CARGOS = ["Pr.", "Pb.", "Dc.", "Aux.", "Aux. Local."];

export const CODIGOS_TRABALHO = [
  "01. ORAÇÃO","02. PREGAÇÃO","03. CEIA","04. DOUTRINA","05. ADMINISTRATIVO","06. ESTUDO MOCIDADE","07. ANIV. CAMP. EVANG.","08. EST. ÓRGÃO LOUVOR","09. ANIV. ÓRGÃO LOUVOR","10. CULTO MOCIDADE","11. ABERTURA FESTIV.","12. CULTO DA FAMÍLIA","13. MANHÃ MISIONÁRIA","14. CULTO EVANGELÍSTICO","15. ANIV. C. O.","16. ANIV. TEMPLO","17. CULTO DE MISSÕES","18. ESTUDO P/ CASAIS","19. ESTUDO P/ CRIANÇAS","20. ESTUDO P/ ADOLESCENTES","21. ENCONTRO DE JOVENS","22. SEMIN. P/ DISCIPULADO","23. SIMPÓSIO EVANGELÍSMO","24. PLANTÃO RÁDIO BOAS NOVAS","25. ANIV. UNIÃO ADOLESCENTES","26. EST.P/ PAIS ADOLESCENTES","27. APOIO CONGREGAÇÃO","28. BATISMO TEMPLO CENTRAL","29. PRÉ-CONGRESSO","30. CONFERÊNCIA MISSIONÁRIA","31. CONGRESSO MOCIDADE","32. CONGRESSO ADOLESCENTES","33. CONGRESSO MULHERES","34. LEITURA EM C. O.","35. AÇÃO DE GRAÇAS","36. ESCOLA ANIMADA","37. CRUZADA EVANGELÍSTICA","38. LEITURA ANIV. C. O.","39. LEITURA ANIV. TEMPLO","40. MINISTRO PLANTÃO T.C.","41. PRESBÍTERO RECEPCIONISTA T.C.","42. VIGÍLIA DE ANO","43. ANIV. CONJUNTO MUSICAL","44. ANIV. CORAL","45. SIMPÓSIO DE DOUTRINA","46. NOITE MISSIONÁRIA","47. CULTO FESTIVO","48. ESTUDO P/ PROFESSORES","49. REUN. EQ. APOIO CASAIS","50. ANIV. C. O. I.","51. CONFERÊNCIA EBD","52. ABERTURA ESCOLA BÍBLICA","53. EST. ESCOLA BÍBLICA","54. ENS. ESCOLA BÍBLICA","55. INAUG. ÓRGÃO LOUVOR","56. ESTUDO BIBLICO","57. CULTO PROATI","58. PALAVRA CULTO VESPERTINO","59. SEMINÁRIO PARA A FAMILIA","60. SECADEAP FAMILIA","61. PONTO DE PREGAÇÃO","62. CULTO DE VIGÍLIA","63. CULTO. CAMP. EVANGEL.","64. FORMATURA DISIPULADO","65. CULTO DO REENCONTRO","66. PROJEFÉRIAS","67. ORAÇÃO DA CAMPANHA","68. ENCONTRO DE CRIANÇAS","69. INAUGURAÇÃO DE TEMPLO","70. ANIV. DO PROATI","71. CULTO JOVEM","72. ENCONTRO DE COMISSÕES","73. ENC. CAMP. EVANGELIZADORAS","74. CULTO MATUTINO"
];

export const DIAS_SEMANA_OFICIAL: DiaSemana[] = [
  { id: "segunda", label: "Segunda-feira - Noite", filtros: ["Chã do Conselho 01", "Monte das Oliveiras", "Av. Brasil", "Engenho Vinagre", "Penedinho"] },
  { id: "terca", label: "Terça-feira - Noite", filtros: ["Templo Matriz"] },
  { id: "quarta", label: "Quarta-feira - Noite", filtros: ["Templo Matriz", "Monte das Oliveiras", "Monte Carmelo", "Av. Brasil", "Nova Canaã", "Itapipiré", "Quinze", "Lot. Bom Jesus", "Belo Oriente", "Jardim Nova Esperança", "Engenho Vinagre", "Três Ladeiras", "Vila Canaã", "Caraú", "Penedinho", "Chã do Conselho 01", "Chã do Conselho 02", "Lot. Fontes de Aldeia", "Alto Planalto", "Itaboraí"] },
  { id: "quintaManha", label: "Quinta-feira - Manhã", filtros: ["Templo Matriz"] },
  { id: "quintaTarde", label: "Quinta-feira - Tarde", filtros: ["Templo Matriz"] },
  { id: "quintaNoite", label: "Quinta-feira - Noite", filtros: ["Quinze", "Três Ladeiras", "Belo Oriente", "Nova Canaã", "Lot. Fontes de Aldeia", "Lot. Bom Jesus", "Itaboraí"] },
  { id: "sexta", label: "Sexta-feira - Noite", filtros: ["Monte Carmelo", "Jardim Nova Esperança", "Itapipiré", "Alto Planalto", "Vila Canaã", "Chã do Conselho 02"] },
  { id: "sabado", label: "Sábado - Noite", filtros: [] },
  { id: "domingoManha", label: "Domingo - Manhã", filtros: [] },
  { id: "domingoNoite", label: "Domingo - Noite", filtros: [] },
];

export const DIAS_SEMANA_LOCAL: DiaSemana[] = [
  { id: "segundaManhaCO", label: "Segunda Feira - Manhã / C.O", parent: "segunda" },
  { id: "segundaTardeCO", label: "Segunda Feira - Tarde / C.O", parent: "segunda" },
  { id: "tercaManhaCO", label: "Terça Feira - Manhã / C.O", parent: "terca" },
  { id: "tercaTardeCO", label: "Terça Feira - Tarde / C.O", parent: "terca" },
  { id: "quartaManhaCO", label: "Quarta Feira - Manhã / C.O", parent: "quarta" },
  { id: "quartaTardeCO", label: "Quarta Feira - Tarde / C.O", parent: "quarta" },
  { id: "quintaTardeCO", label: "Quinta Feira - Tarde / C.O", parent: "quintaTarde" },
  { id: "sextaManhaCO", label: "Sexta Feira - Manhã / C.O", parent: "sexta" },
  { id: "sextaTardeCO", label: "Sexta Feira - Tarde / C.O", parent: "sexta" }
];

export const DIAS_SEMANA_PP: DiaSemana[] = [
  { id: "quintaNoitePP", label: "Quinta - Feira - Noite", parent: "quintaNoite" },
  { id: "sextaNoitePP", label: "Sexta - Feira - Noite", parent: "sexta" }
];

export const DIAS_SEMANA_PORTARIA: DiaSemana[] = [
  { id: "segundaNoitePortaria", label: "Segunda Feira - Noite", parent: "segunda" },
  { id: "tercaNoitePortaria", label: "Terça Feira - Noite", parent: "terca" },
  { id: "quartaNoitePortaria", label: "Quarta Feira - Noite", parent: "quarta" },
  { id: "quintaTardePortaria", label: "Quinta Feira - Tarde / C.O", parent: "quintaTarde" },
  { id: "quintaNoitePortaria", label: "Quinta Feira - Noite", parent: "quintaNoite" },
  { id: "sextaNoitePortaria", label: "Sexta Feira - Noite", parent: "sexta" },
  { id: "sabadoCOIPortaria", label: "Sabádo - C.O.I", parent: "sabado" },
  { id: "sabadoNoitePortaria", label: "Sabádo - Noite", parent: "sabado" },
  { id: "domingoManhaPortaria", label: "Domingo - Manhã", parent: "domingoManha" },
  { id: "domingoNoitePortaria", label: "Domingo - Noite", parent: "domingoNoite" }
];

export const ESCALA_LOCAL_PADRAO: EscalaLocalItem[] = [
  { categoria: 'Local', data: 'segundaManhaCO', local: 'Quinze', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Benjamin Alexandre'] },
  { categoria: 'Local', data: 'segundaManhaCO', local: 'Canaã', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Manuel Elias'] },
  { categoria: 'Local', data: 'segundaTardeCO', local: 'Quinze', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Sandro Fernandes'] },
  { categoria: 'Local', data: 'segundaTardeCO', local: 'Canaã', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Edinael Eliel'] },
  { categoria: 'Local', data: 'segundaTardeCO', local: 'Itaboraí', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Diogo Santana'] },
  { categoria: 'Local', data: 'tercaManhaCO', local: 'Monte Carmelo', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Benjamin Alexandre'] },
  { categoria: 'Local', data: 'tercaManhaCO', local: 'Chã do Conselho', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Valmir Gervásio'] },
  { categoria: 'Local', data: 'tercaTardeCO', local: 'Chã do Conselho', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Samuel Amaro'] },
  { categoria: 'Local', data: 'tercaTardeCO', local: 'Monte Carmelo', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Roberto Antônio'] },
  { categoria: 'Local', data: 'tercaTardeCO', local: 'Belo Oriente', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Jefferson Balbino'] },
  { categoria: 'Local', data: 'tercaTardeCO', local: 'Lot. Bom Jesus', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. José Joaquim'] },
  { categoria: 'Local', data: 'tercaTardeCO', local: 'Vila Canaã', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Arnaldo Bento'] },
  { categoria: 'Local', data: 'quartaManhaCO', local: 'Itapipiré', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Local. André Francisco'] },
  { categoria: 'Local', data: 'quartaTardeCO', local: 'Alto Planalto', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Samuel Amaro'] },
  { categoria: 'Local', data: 'quartaTardeCO', local: 'Av. Brasil', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Manuel Elias'] },
  { categoria: 'Local', data: 'quartaTardeCO', local: 'Itapipiré', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Aux. Local. Washington Souza'] },
  { categoria: 'Local', data: 'quintaTardeCO', local: 'Jardim Nova Esperança', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Benjamin Alexandre', ''] },
  { categoria: 'Local', data: 'quintaTardeCO', local: 'Engenho Vinagre', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Pb. Leonardo Manoel', ''] },
  { categoria: 'Local', data: 'sextaManhaCO', local: 'Monte das Oliveiras', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Pb. Antônio Alexandre', ''] },
  { categoria: 'Local', data: 'sextaTardeCO', local: 'Lot. Fontes de Aldeia', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Dc. Dorgival Gervásio', ''] },
  { categoria: 'Local', data: 'sextaTardeCO', local: 'Monte das Oliveiras', codigo: '34', escalados: ['Pr. Severino Guilhermino', '', 'Pb. Marcos Henrique', ''] },
  { categoria: 'PP', data: 'quintaNoitePP', local: 'Miritibi (PP)', codigo: '61', escalados: ['Dc. Dorgival Gervásio', 'Dc. Samuel Amaro', 'Aux. Paulo Cândido', 'Aux. Local. José Valter'] },
  { categoria: 'PP', data: 'sextaNoitePP', local: 'Belo Oriente (Jeová Sama) (PP)', codigo: '61', escalados: ['Pb. Ednaldo Antônio', 'Dc. Daniel Domingos', 'Aux. Jefferson Balbino', 'Aux. Local. Gilmario Terto'] },
  { categoria: 'Portaria', data: 'segundaNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Dc. Severino José', 'Aux. Local. Washington Souza', 'Aux. Local. Severino Alexandre', ''] },
  { categoria: 'Portaria', data: 'tercaNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Aux. Jeremias Marculino', 'Aux. Edinael Eliel', 'Aux. Local. Joseilton Alves', ''] },
  { categoria: 'Portaria', data: 'quartaNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Dc. Severino José', 'Aux. Local. Daniel Lira', 'Aux. Local. Israel Antonio', ''] },
  { categoria: 'Portaria', data: 'quartaNoitePortaria', local: 'Chã do Conselho 2', codigo: '', escalados: ['Dc. Kleitonlee Marcionilo', 'Aux. Bruno Bezerra', 'Aux. Local. Cristiano Antônio', ''] },
  { categoria: 'Portaria', data: 'quintaTardePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Dc. José Domingos', '', '', ''] },
  { categoria: 'Portaria', data: 'quintaNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Aux. Local. Sebastião Ribeiro', '', '', ''] },
  { categoria: 'Portaria', data: 'sextaNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Aux. Local. Allyson Nyerton', '', '', ''] },
  { categoria: 'Portaria', data: 'sextaNoitePortaria', local: 'Chã do Conselho 2', codigo: '', escalados: ['Dc. Samuel Amaro', 'Aux. Jessé Sabino', 'Aux. Local. Anderson Ferreira', 'Aux. Local. Roberto Joaquim'] },
  { categoria: 'Portaria', data: 'sabadoCOIPortaria', local: 'Templo Matriz', codigo: '', escalados: ['Aux. Local. Daniel Lira', '', '', ''] },
  { categoria: 'Portaria', data: 'sabadoNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['', '', '', ''] },
  { categoria: 'Portaria', data: 'domingoManhaPortaria', local: 'Templo Matriz', codigo: '', escalados: ['', '', '', ''] },
  { categoria: 'Portaria', data: 'domingoNoitePortaria', local: 'Templo Matriz', codigo: '', escalados: ['Dc. Severino José', 'Aux. Jeremias Marculino', 'Aux. Local. Israel Antonio', ''] },
  { categoria: 'Portaria', data: 'domingoNoitePortaria', local: 'Chã do Conselho 2', codigo: '', escalados: ['Dc. Dorgival Gervásio', 'Aux. Local. Luiz Pereira', 'Aux. Local. Cristiano Antônio', ''] }
];

export const CONGREGACOES_PADRAO: Congregacao[] = [
  { nome: "Templo Matriz", endereco: "Av. João Pessoa de Morães Guerra, 176, Centro, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "1940-01-01", departamentos: [] },
  { nome: "Congregação Av. Brasil", endereco: "Rua do Canal, 38, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2010-05-15", departamentos: [] },
  { nome: "Congregação Canaã", endereco: "Rua Manoel Carneiro, 36, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2005-08-10", departamentos: [] },
  { nome: "Lot. Bom Jesus", endereco: "Rua Nova, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2012-03-20", departamentos: [] },
  { nome: "Monte das Oliveiras", endereco: "Rua Antônio Carneiro, 848, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "1998-11-05", departamentos: [] }
];

export const OBREIROS_PADRAO: Obreiro[] = [
  { nome: "Severino Guilhermino", cargo: "Pr.", congregacao: "Templo Matriz" },
  { nome: "Amauri Pereira", cargo: "Pb.", congregacao: "Av. Brasil" }
];

export const TIPOS_CULTO_PADRAO: TipoCulto[] = [
  { nome: "Santa Ceia", codigo: "03" },
  { nome: "Administrativo", codigo: "05" },
  { nome: "Culto para Mocidade", codigo: "10" },
  { nome: "Culto para o PROATI", codigo: "57" }
];

export const REGRAS_CULTO_PADRAO: RegraCulto[] = [
  { congregacao: "Engenho Vinagre", dia: "segunda", regraSemana: ["", "Santa Ceia", "", "Santa Ceia", ""] },
  { congregacao: "Monte das Oliveiras", dia: "segunda", regraSemana: ["", "Santa Ceia", "", "", ""] },
  { congregacao: "Chã do Conselho 01", dia: "segunda", regraSemana: ["", "", "Santa Ceia", "", ""] },
  { congregacao: "Penedinho", dia: "segunda", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Congregação Av. Brasil", dia: "segunda", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Templo Matriz", dia: "terca", regraSemana: ["", "Santa Ceia", "Administrativo", "", ""] },
  { congregacao: "Caraú", dia: "quarta", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Belo Oriente", dia: "quintaNoite", regraSemana: ["", "Santa Ceia", "", "", ""] },
  { congregacao: "Três Ladeiras", dia: "quintaNoite", regraSemana: ["", "Santa Ceia", "", "", ""] },
  { congregacao: "Itaboraí", dia: "quintaNoite", regraSemana: ["", "Santa Ceia", "", "", ""] },
  { congregacao: "Quinze", dia: "quintaNoite", regraSemana: ["", "", "Santa Ceia", "", ""] },
  { congregacao: "Lot. Bom Jesus", dia: "quintaNoite", regraSemana: ["", "", "Santa Ceia", "", ""] },
  { congregacao: "Lot. Fontes de Aldeia", dia: "quintaNoite", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Congregação Canaã", dia: "quintaNoite", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Itapipiré", dia: "sexta", regraSemana: ["Santa Ceia", "", "", "", ""] },
  { congregacao: "Alto Planalto", dia: "sexta", regraSemana: ["Santa Ceia", "", "", "", ""] },
  { congregacao: "Monte Carmelo", dia: "sexta", regraSemana: ["", "Santa Ceia", "", "", ""] },
  { congregacao: "Jardim Nova Esperança", dia: "sexta", regraSemana: ["", "", "Santa Ceia", "", ""] },
  { congregacao: "Vila Canaã", dia: "sexta", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Chã do Conselho 02", dia: "sexta", regraSemana: ["", "", "", "Santa Ceia", ""] },
  { congregacao: "Templo Matriz", dia: "domingoNoite", regraSemana: ["Culto para Mocidade", "", "Culto para o PROATI", "", ""] },
  { congregacao: "Engenho Vinagre", dia: "domingoNoite", regraSemana: ["Culto para Mocidade", "", "", "", ""] },
  { congregacao: "Congregação Canaã", dia: "domingoNoite", regraSemana: ["Culto para o PROATI", "Culto para Mocidade", "", "Culto para o PROATI", ""] },
  { congregacao: "Itaboraí", dia: "domingoNoite", regraSemana: ["", "Culto para Mocidade", "", "", ""] },
  { congregacao: "Monte das Oliveiras", dia: "domingoNoite", regraSemana: ["", "Culto para Mocidade", "", "Culto para o PROATI", ""] },
  { congregacao: "Belo Oriente", dia: "domingoNoite", regraSemana: ["Culto para o PROATI", "", "Culto para Mocidade", "", ""] },
  { congregacao: "Monte Carmelo", dia: "domingoNoite", regraSemana: ["", "Culto para o PROATI", "Culto para Mocidade", "", ""] },
  { congregacao: "Chã do Conselho 01", dia: "domingoNoite", regraSemana: ["", "", "Culto para Mocidade", "", ""] },
  { congregacao: "Lot. Fontes de Aldeia", dia: "domingoNoite", regraSemana: ["", "", "", "Culto para Mocidade", ""] },
  { congregacao: "Congregação Av. Brasil", dia: "domingoNoite", regraSemana: ["", "Culto para o PROATI", "", "Culto para Mocidade", ""] },
  { congregacao: "Lot. Bom Jesus", dia: "domingoNoite", regraSemana: ["", "", "", "Culto para Mocidade", ""] },
  { congregacao: "Itapipiré", dia: "domingoNoite", regraSemana: ["", "Culto para o PROATI", "", "Culto para Mocidade", ""] },
  { congregacao: "Quinze", dia: "domingoNoite", regraSemana: ["", "", "Culto para o PROATI", "Culto para Mocidade", ""] },
  { congregacao: "Jardim Nova Esperança", dia: "domingoNoite", regraSemana: ["", "", "", "Culto para o PROATI", ""] }
];

export const TAB_ICONS: Record<string, string> = {
  "escala-oficial": "📆",
  "escala-local": "📋",
  "congregacoes": "⛪",
  "obreiros": "👥",
  "calendario": "📅",
  "historia": "📜",
  "config": "⚙️"
};
