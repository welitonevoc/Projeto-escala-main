import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { 
  Calendar, Users, MapPin, Settings, Save, Plus, Trash2, Printer,
  Search, RefreshCw, Church
} from "lucide-react";
import { format, addDays, startOfWeek, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface Obreiro {
  nome: string;
  cargo: string;
  congregacao: string;
}

interface Departamento {
  id: string;
  nome: string;
  dataCriacao: string;
  dirigente: string;
  viceDirigente: string;
  secretaria: string;
  viceSecretaria: string;
}

interface Congregacao {
  nome: string;
  endereco: string;
  responsavelNome: string;
  dataInauguracao: string;
  departamentos: Departamento[];
}

interface EscalaItem {
  congregacao: string;
  codigo: string;
  escalados: string[];
}

interface EscalaOficialData {
  [dia: string]: EscalaItem[];
}

interface EscalaLocalItem {
  categoria: string;
  data: string;
  local: string;
  codigo: string;
  escalados: string[];
}

interface Evento {
  id: string;
  data: string;
  descricao: string;
  cc: string;
  congregacao: string;
}

interface TipoCulto {
  nome: string;
  codigo: string;
}

interface RegraCulto {
  congregacao: string;
  dia: string;
  regraSemana: string[]; // [week1_code, week2_code, etc]
}

// --- Constants ---
const CODIGOS_TRABALHO = [
  "01. ORAÇÃO","02. PREGAÇÃO","03. CEIA","04. DOUTRINA","05. ADMINISTRATIVO","06. ESTUDO MOCIDADE","07. ANIV. CAMP. EVANG.","08. EST. ÓRGÃO LOUVOR","09. ANIV. ÓRGÃO LOUVOR","10. CULTO MOCIDADE","11. ABERTURA FESTIV.","12. CULTO DA FAMÍLIA","13. MANHÃ MISIONÁRIA","14. CULTO EVANGELÍSTICO","15. ANIV. C. O.","16. ANIV. TEMPLO","17. CULTO DE MISSÕES","18. ESTUDO P/ CASAIS","19. ESTUDO P/ CRIANÇAS","20. ESTUDO P/ ADOLESCENTES","21. ENCONTRO DE JOVENS","22. SEMIN. P/ DISCIPULADO","23. SIMPÓSIO EVANGELÍSMO","24. PLANTÃO RÁDIO BOAS NOVAS","25. ANIV. UNIÃO ADOLESCENTES","26. EST.P/ PAIS ADOLESCENTES","27. APOIO CONGREGAÇÃO","28. BATISMO TEMPLO CENTRAL","29. PRÉ-CONGRESSO","30. CONFERÊNCIA MISSIONÁRIA","31. CONGRESSO MOCIDADE","32. CONGRESSO ADOLESCENTES","33. CONGRESSO MULHERES","34. LEITURA EM C. O.","35. AÇÃO DE GRAÇAS","36. ESCOLA ANIMADA","37. CRUZADA EVANGELÍSTICA","38. LEITURA ANIV. C. O.","39. LEITURA ANIV. TEMPLO","40. MINISTRO PLANTÃO T.C.","41. PRESBÍTERO RECEPCIONISTA T.C.","42. VIGÍLIA DE ANO","43. ANIV. CONJUNTO MUSICAL","44. ANIV. CORAL","45. SIMPÓSIO DE DOUTRINA","46. NOITE MISSIONÁRIA","47. CULTO FESTIVO","48. ESTUDO P/ PROFESSORES","49. REUN. EQ. APOIO CASAIS","50. ANIV. C. O. I.","51. CONFERÊNCIA EBD","52. ABERTURA ESCOLA BÍBLICA","53. EST. ESCOLA BÍBLICA","54. ENS. ESCOLA BÍBLICA","55. INAUG. ÓRGÃO LOUVOR","56. ESTUDO BIBLICO","57. CULTO PROATI","58. PALAVRA CULTO VESPERTINO","59. SEMINÁRIO PARA A FAMILIA","60. SECADEAP FAMILIA","61. PONTO DE PREGAÇÃO","62. CULTO DE VIGÍLIA","63. CULTO. CAMP. EVANGEL.","64. FORMATURA DISIPULADO","65. CULTO DO REENCONTRO","66. PROJEFÉRIAS","67. ORAÇÃO DA CAMPANHA","68. ENCONTRO DE CRIANÇAS","69. INAUGURAÇÃO DE TEMPLO","70. ANIV. DO PROATI","71. CULTO JOVEM","72. ENCONTRO DE COMISSÕES","73. ENC. CAMP. EVANGELIZADORAS","74. CULTO MATUTINO"
];

const DIAS_SEMANA_OFICIAL = [
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


const DIAS_SEMANA_LOCAL = [
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


const DIAS_SEMANA_PP = [
  { id: "quintaNoitePP", label: "Quinta - Feira - Noite", parent: "quintaNoite" }, 
  { id: "sextaNoitePP", label: "Sexta - Feira - Noite", parent: "sexta" }
];

const DIAS_SEMANA_PORTARIA = [
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

const CARGOS = ["Pr.", "Pb.", "Dc.", "Aux.", "Aux. Local."];

const ESCALA_LOCAL_PADRAO: EscalaLocalItem[] = [
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
  
  // Ponto de Pregação
  { categoria: 'PP', data: 'quintaNoitePP', local: 'Miritibi (PP)', codigo: '61', escalados: ['Dc. Dorgival Gervásio', 'Dc. Samuel Amaro', 'Aux. Paulo Cândido', 'Aux. Local. José Valter'] },
  { categoria: 'PP', data: 'sextaNoitePP', local: 'Belo Oriente (Jeová Sama) (PP)', codigo: '61', escalados: ['Pb. Ednaldo Antônio', 'Dc. Daniel Domingos', 'Aux. Jefferson Balbino', 'Aux. Local. Gilmario Terto'] },

  // Portaria
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

const CONGREGACOES_PADRAO: Congregacao[] = [
  { nome: "Templo Matriz", endereco: "Av. João Pessoa de Morães Guerra, 176, Centro, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "1940-01-01", departamentos: [] },
  { nome: "Congregação Av. Brasil", endereco: "Rua do Canal, 38, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2010-05-15", departamentos: [] },
  { nome: "Congregação Canaã", endereco: "Rua Manoel Carneiro, 36, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2005-08-10", departamentos: [] },
  { nome: "Lot. Bom Jesus", endereco: "Rua Nova, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "2012-03-20", departamentos: [] },
  { nome: "Monte das Oliveiras", endereco: "Rua Antônio Carneiro, 848, Araçoiaba - PE", responsavelNome: "", dataInauguracao: "1998-11-05", departamentos: [] }
];

const OBREIROS_PADRAO: Obreiro[] = [
  { nome: "Severino Guilhermino", cargo: "Pr.", congregacao: "Templo Matriz" },
  { nome: "Amauri Pereira", cargo: "Pb.", congregacao: "Av. Brasil" }
];

const TIPOS_CULTO_PADRAO: TipoCulto[] = [
  { nome: "Santa Ceia", codigo: "03" },
  { nome: "Administrativo", codigo: "05" },
  { nome: "Culto para Mocidade", codigo: "10" },
  { nome: "Culto para o PROATI", codigo: "57" }
];

const REGRAS_CULTO_PADRAO: RegraCulto[] = [
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

const DIAS_OFFSET: Record<string, number> = {
  segunda: 0, terca: 1, quarta: 2, quintaManha: 3, quintaTarde: 3, quintaNoite: 3,
  sexta: 4, sabado: 5, domingoManha: 6, domingoNoite: 6
};

export default function App() {
  const [activeTab, setActiveTab] = useState("escala-oficial");
  const [dataInicio, setDataInicio] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataVisual, setDataVisual] = useState(new Date());

  // Data State
  const [obreiros, setObreiros] = useLocalStorage<Obreiro[]>('obreiros', OBREIROS_PADRAO);
  const [congregacoes, setCongregacoes] = useLocalStorage<Congregacao[]>('congregacoes', CONGREGACOES_PADRAO);
  const [escalaOficial, setEscalaOficial] = useLocalStorage<EscalaOficialData>('escalaOficial', {});
  const [escalaLocal, setEscalaLocal] = useLocalStorage<EscalaLocalItem[]>('escalaLocal', ESCALA_LOCAL_PADRAO);
  const [eventos, setEventos] = useLocalStorage<Evento[]>('eventos', []);
  const [tiposCulto, setTiposCulto] = useLocalStorage<TipoCulto[]>('tiposCulto', TIPOS_CULTO_PADRAO);
  const [regrasCulto, setRegrasCulto] = useLocalStorage<RegraCulto[]>('regrasCulto', REGRAS_CULTO_PADRAO);

  // Sorting & Modals
  const [editingCongregacao, setEditingCongregacao] = useState<number | null>(null);
  const [termoBuscaObreiro, setTermoBuscaObreiro] = useState("");
  const [novoObreiro, setNovoObreiro] = useState({nome: "", cargo: "Aux.", congregacao: ""});
  const [novoEvento, setNovoEvento] = useState({data: "", descricao: "", cc: "", congregacao: ""});
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<{ isOpen: boolean; worker: string; congregacao: string; diaLabel: string } | null>(null);

  useEffect(() => {
    checkStatus();
    loadData();
  }, [dataInicio]);

  const verificarDuplicadoNoDia = (valor: string, diaId: string, localAtual: string) => {
    if (!valor) return;
    
    const escalasDaEscalaLocal = escalaLocal.filter(l => {
      const diaInfo = DIAS_SEMANA_LOCAL.find(d => d.id === l.data) || DIAS_SEMANA_PP.find(d => d.id === l.data) || DIAS_SEMANA_PORTARIA.find(d => d.id === l.data);
      return diaInfo?.parent === diaId || diaInfo?.id === diaId;
    });
    
    const todasEscalas: any[] = [...(escalaOficial[diaId] || []), ...escalasDaEscalaLocal];
    
    for (const item of todasEscalas) {
      if (item.escalados?.includes(valor)) {
        const localConflito = item.local || item.congregacao;
        if (localConflito !== localAtual) {
          setDuplicateModal({
            isOpen: true,
            worker: valor,
            congregacao: localConflito,
            diaLabel: getDiaLabelClean(diaId),
          });
          return;
        }
      }
    }
  };

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setIsConfigured(data.configured);
    } catch { setIsConfigured(false); }
  };

  const getWeekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync");
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      setIsConfigured(true);
      alert("✅ Dados baixados e sincronizados com sucesso!");
      
      if (data.obreiros?.length) {
        setObreiros(data.obreiros.map((r: any) => ({ nome: r[0], cargo: r[1], congregacao: r[2] })));
      }
      
      if (data.congregacoes?.length) {
        setCongregacoes(data.congregacoes.map((r: any) => ({
          nome: r[0], endereco: r[1], responsavelNome: r[2], dataInauguracao: r[3],
          departamentos: r[4] ? JSON.parse(r[4]) : []
        })));
      }

      const oficial: EscalaOficialData = {};
      data.escalaOficial?.forEach((row: any) => {
        if (row[0] === dataInicio) {
          if (!oficial[row[1]]) oficial[row[1]] = [];
          oficial[row[1]].push({ congregacao: row[2], codigo: row[3], escalados: row[4]?.split(",") || [] });
        }
      });
      
      if (Object.keys(oficial).length === 0) {
        DIAS_SEMANA_OFICIAL.forEach(dia => {
          oficial[dia.id] = dia.filtros.map(cong => ({ congregacao: cong, codigo: "04", escalados: ["", "", ""] }));
        });
      }
      setEscalaOficial(oficial);

      const loadedLocal = data.escalaLocal?.map((r: any) => ({ categoria: r[1], data: r[2], local: r[3], codigo: r[4], escalados: r[5]?.split(",") || [] })) || [];
      if (loadedLocal.length === 0) setEscalaLocal(ESCALA_LOCAL_PADRAO);
      else setEscalaLocal(loadedLocal);
      setEventos(data.eventos?.map((r: any) => ({ id: Math.random().toString(36).substr(2, 9), data: r[0], descricao: r[1], cc: r[2], congregacao: r[3] })) || []);
      if (data.tiposCulto?.length) setTiposCulto(data.tiposCulto.map((r: any) => ({ nome: r[0], codigo: r[1] })));
      if (data.regrasCulto?.length) setRegrasCulto(data.regrasCulto.map((r: any) => ({ congregacao: r[0], dia: r[1], regraSemana: r.slice(2) })));
      
    } catch (err) {
      console.warn("API não disponível (esperado no GitHub Pages). Usando dados locais.");
    } finally { setLoading(false); }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const reqs = [
        { range: "Obreiros!A:C", values: obreiros.map(o => [o.nome, o.cargo, o.congregacao]) },
        { range: "Congregacoes!A:E", values: congregacoes.map(c => [c.nome, c.endereco, c.responsavelNome, c.dataInauguracao, JSON.stringify(c.departamentos)]) },
        { range: "EscalaLocal!A:F", values: escalaLocal.map(l => [dataInicio, l.categoria, l.data, l.local, l.codigo, l.escalados.join(",")]) },
        { range: "Eventos!A:D", values: eventos.map(e => [e.data, e.descricao, e.cc, e.congregacao]) },
        { range: "TiposCulto!A:B", values: tiposCulto.map(t => [t.nome, t.codigo]) },
        { range: "RegrasCulto!A:G", values: regrasCulto.map(r => [r.congregacao, r.dia, ...r.regraSemana]) }
      ];

      const oficialRows: any[] = [];
Object.entries(escalaOficial as any).forEach(([dia, items]: any[]) => {
         items.forEach((item: any) => oficialRows.push([dataInicio, dia, item.congregacao, item.codigo, item.escalados.join(",")]));
      });
      reqs.push({ range: "EscalaOficial!A:E", values: oficialRows });

      for (const req of reqs) {
        await fetch("/api/sheets/update", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req)
        });
      }
      alert("✅ Dados salvos na nuvem!");
    } catch { alert("❌ Erro ao salvar dados. Os dados estão salvos localmente, mas não foram sincronizados com a nuvem."); }
    finally { setSaving(false); }
  };

  const aplicarRegrasGerais = () => {
    const start = parseISO(dataInicio);
    const newOficial = { ...escalaOficial };
    
    Object.keys(newOficial).forEach(diaId => {
      const weekNum = getWeekOfMonth(addDays(start, DIAS_OFFSET[diaId] || 0));
      
      newOficial[diaId] = (newOficial[diaId] || []).map(item => {
        const regra = regrasCulto.find(r => r.congregacao === item.congregacao && r.dia === diaId);
        if (regra && regra.regraSemana[weekNum - 1]) {
          const type = tiposCulto.find(t => t.nome === regra.regraSemana[weekNum - 1]);
          return { ...item, codigo: type ? type.codigo : item.codigo };
        }
        return item;
      });
    });
    setEscalaOficial(newOficial);
    alert(`⚡ Regras aplicadas para a ${getWeekOfMonth(start)}ª semana!`);
  };

  const getFullDateStr = (diaId: string) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[diaId] || 0);
    return format(date, "EEEE - pppp ' / ' dd ' de ' MMMM yyyy", { locale: ptBR }).replace("Noite ", "Noite").replace("Manhã ", "Manhã");
  };

  const getDiaLabelClean = (diaId: string) => {
    const label = DIAS_SEMANA_OFICIAL.find(d => d.id === diaId)?.label || "";
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[diaId] || 0);
    return `${label} / ${format(date, "dd 'de' MMMM yyyy", { locale: ptBR })}`;
  };

  const getDiaLabelLocal = (diaLocal: any) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[diaLocal.parent] || 0);
    return `${format(date, "dd/MM/yyyy")} - ${diaLocal.label}`;
  };

  return (
    <div className="min-h-screen bg-[#eef3f9] text-[#0a2a4a] font-sans print:bg-white print:p-0">
      {/* Menu Fixo */}
      <div className="bg-white border-b-2 border-[#1a5fa0] sticky top-0 z-[50] no-print">
         <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1">
            {[ 
               {id: "escala-oficial", label: "📆 Escala Oficial"},
               {id: "escala-local", label: "📋 Escala Local"},
               {id: "congregacoes", label: "⛪ Congregações"},
               {id: "obreiros", label: "👥 Obreiros"},
               {id: "calendario", label: "📅 Calendário"},
               {id: "config", label: "⚙️ Configurações"}
            ].map(tab => (
               <button 
                 key={tab.id} 
                 onClick={() => setActiveTab(tab.id)}
                 className={`px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap rounded-t-lg transition-all `}
               >
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {(activeTab === "escala-oficial" || activeTab === "escala-local") && (
           <div className="bg-white p-12 rounded-[50px] border border-[#c5d8ef] shadow-2xl mb-12 overflow-hidden relative print:border-2 print:border-slate-300 print:shadow-none">
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left space-y-6 flex-1">
                   <div className="space-y-0.5">
                     <p className="text-xl font-black text-[#0d4a8a] italic tracking-tight">Pr. Ailton José Alves</p>
                     <p className="text-[9px] font-black text-[#0d4a8a]/70 uppercase tracking-[4px]">Presidente da IEADPE</p>
                   </div>
                   <div className="space-y-0.5">
                     <p className="text-xl font-black text-[#0d4a8a] italic tracking-tight">Pr. Severino Guilhermino</p>
                     <p className="text-[9px] font-black text-[#0d4a8a]/70 uppercase tracking-[4px]">Gestor da Filial</p>
                   </div>
                </div>
                <div className="flex-1 flex justify-center">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/IEADPE.png" className="w-44 h-44 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="text-center md:text-right flex-1">
                   <h1 className="text-7xl font-black text-[#0d4a8a] tracking-tighter leading-none mb-1">IEADPE</h1>
                   <p className="text-sm font-black text-[#0d4a8a] tracking-[10px] uppercase pl-2">Araçoiaba - PE</p>
                </div>
             </div>
           </div>
        )}

        <div className="bg-[#e6f0fa] px-8 py-3 rounded-full border-none shadow-sm mb-10 flex flex-wrap items-center justify-center gap-6 no-print max-w-fit mx-auto">
           <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={20} />
              <label className="font-bold text-[#0a2a4a] text-sm">Semana de:</label>
              <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="bg-white border border-[#a8c8e8] rounded-full px-4 py-2 font-bold text-[#0d3d7a] outline-none focus:ring-2 focus:ring-blue-500" />
           </div>
           <div className="flex gap-2 items-center">
               <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isConfigured ? '☁️ Online' : '💾 Local'}
               </span>
               <button onClick={loadData} className="bg-[#0d4a8a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Sincronizando..." : "Sincronizar"}
               </button>
              <button 
                onClick={() => {
                   setActiveTab("escala-oficial");
                   setTimeout(() => window.print(), 100);
                }} 
                className="bg-[#0d4a8a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                 <Printer size={14} /> Imprimir Oficial
              </button>
              <button 
                onClick={() => {
                   setActiveTab("escala-local");
                   setTimeout(() => window.print(), 100);
                }} 
                className="bg-[#2a6e2a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2"
              >
                 <Printer size={14} /> Imprimir Local
              </button>
           </div>
</div>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           
           {activeTab === "escala-oficial" && (
             <div className="space-y-10">
                <div className="bg-white p-2 rounded-2xl border border-[#c5d8ef] shadow-sm overflow-x-auto print:border-none print:shadow-none no-print">
                   <div className="flex gap-1 p-2 min-w-max">
                      {CODIGOS_TRABALHO.map(c => <span key={c} className="text-[8px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap uppercase italic tracking-tighter">{c}</span>)}
                   </div>
                </div>

                {DIAS_SEMANA_OFICIAL.map(dia => (
                  <div key={dia.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden print:shadow-none print:border-slate-300">
                     <div className="bg-[#0d4a8a] px-5 py-3 flex justify-between items-center border-l-8 border-[#1a70b8]">
                        <h2 className="text-white text-[1.3rem] font-semibold">{dia.label}</h2>
                     </div>
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                              <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Congregação</th>
                              <th className="px-2 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest text-center">Cód</th>
                              <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-[8px] text-center italic">Escalados</th>
                              <th className="w-10 no-print"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c5d8ef]">
                           {(escalaOficial[dia.id] || []).map((item, idx) => (
                              <tr key={idx} className="group hover:bg-[#e6f0fa]/30 transition-all">
                                 <td className="px-8 py-2"><input type="text" value={item.congregacao} onChange={(e) => { const ne = {...escalaOficial}; ne[dia.id][idx].congregacao = e.target.value; setEscalaOficial(ne); }} className="bg-transparent border-none text-[11px] font-black text-slate-700 w-full focus:ring-0 p-0" /></td>
                                 <td className="px-2 py-2"><input type="text" value={item.codigo} onChange={(e) => { const ne = {...escalaOficial}; ne[dia.id][idx].codigo = e.target.value; setEscalaOficial(ne); }} className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[11px] font-black py-1 outline-none" /></td>
                                 <td className="px-8 py-2">
                                    <div className="flex gap-2">
                                       {[0,1,2].map(eIdx => (
                                          <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ""} onChange={(e) => { const ne = {...escalaOficial}; ne[dia.id][idx].escalados[eIdx] = e.target.value; setEscalaOficial(ne); verificarDuplicadoNoDia(e.target.value, dia.id, item.congregacao); }} className="flex-1 min-w-[120px] bg-slate-50 border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-2 no-print">
                                    <button onClick={() => {
                                       const ne = {...escalaOficial};
                                       ne[dia.id].splice(idx, 1);
                                       setEscalaOficial(ne);
                                    }} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     <button onClick={() => {
                        const ne = {...escalaOficial};
                        if(!ne[dia.id]) ne[dia.id] = [];
                        ne[dia.id].push({congregacao: "", codigo: "04", escalados: ["", "", ""]});
                        setEscalaOficial(ne);
                     }} className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase text-slate-400 tracking-widest transition-all">
                        + Adicionar Linha
                     </button>
                  </div>
                ))}
             </div>
           )}

           {activeTab === "escala-local" && (
              <div className="space-y-10">
                 {DIAS_SEMANA_LOCAL.map(dia => (
                   <div key={dia.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden print:shadow-none print:border-slate-300">
                      <div className="bg-[#0d4a8a] px-5 py-3 flex justify-between items-center border-l-8 border-[#1a70b8]">
                         <h2 className="text-white text-[1.3rem] font-semibold">
                            {getDiaLabelLocal(dia)}
                         </h2>
                      </div>
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                               <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Congregação</th>
                               <th className="px-2 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest text-center">Cód</th>
                               <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-[8px] text-center italic">Escalados</th>
                               <th className="w-10 no-print"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[#c5d8ef]">
                            {(escalaLocal.filter(l => l.data === dia.id) || []).map((item, idx) => (
                               <tr key={idx} className="group hover:bg-[#e6f0fa]/30 transition-all">
                                  <td className="px-8 py-2"><input type="text" value={item.local} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].local = e.target.value; setEscalaLocal(ne);} }} className="text-[0.85rem] font-semibold text-[#0a2a4a] bg-[#f5f9ff] w-full px-2 py-1 outline-none border-none" /></td>
                                  <td className="px-2 py-2"><input type="text" value={item.codigo} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].codigo = e.target.value; setEscalaLocal(ne);} }} className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[0.85rem] font-black py-1 outline-none" /></td>
                                  <td className="px-8 py-2">
                                     <div className="flex gap-2">
{[0,1,2,3].map(eIdx => (
                                            <input 
                                              key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ""} 
                                              placeholder="..."
                                              onChange={(e) => {
                                                 const ne = [...escalaLocal];
                                                 const itemIdx = ne.indexOf(item);
                                                 if(itemIdx > -1) {
                                                    ne[itemIdx] = { ...ne[itemIdx], escalados: [...(ne[itemIdx].escalados || [])] };
                                                    ne[itemIdx].escalados[eIdx] = e.target.value;
                                                    setEscalaLocal(ne);
                                                    const parentDia = dia.parent || dia.id;
                                                    verificarDuplicadoNoDia(e.target.value, parentDia, item.local);
                                                 }
                                              }}
                                              className="flex-1 min-w-[120px] bg-white border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[0.85rem] font-bold text-slate-800 outline-none transition-all shadow-sm"
                                            />
                                         ))}
                                     </div>
                                  </td>
                                  <td className="px-2 no-print">
                                     <button onClick={() => {
                                        const ne = [...escalaLocal];
                                        const itemIdx = ne.indexOf(item);
                                        if(itemIdx > -1) {
                                           ne.splice(itemIdx, 1);
                                           setEscalaLocal(ne);
                                        }
                                     }} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      <button onClick={() => {
                         const ne = [...escalaLocal];
                         ne.push({categoria: "Local", data: dia.id, local: "", codigo: "34", escalados: ["Pr. Severino Guilhermino", "", ""]});
                         setEscalaLocal(ne);
                      }} className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase text-[#0d4a8a] tracking-widest transition-all">
                         + Adicionar Linha Local
                      </button>
                   </div>
))}
               </div>

)}

         {activeTab === "escala-local" && (
         <div className="mt-12 space-y-8">
           <div className="bg-orange-100 border-2 border-dashed border-orange-500 rounded-[20px] p-6">
                     <h2 className="text-[#b83a10] text-xl font-black uppercase tracking-wider flex items-center gap-3">
                        <span className="bg-[#e05c2a] text-white px-3 py-1 rounded-full text-sm">PP</span> Ponto de Pregação (PP) - Semanal
                     </h2>
                  </div>
                  {DIAS_SEMANA_PP.map(dia => (
                    <div key={dia.id} className="bg-white rounded-[20px] border border-[#e05c2a]/30 shadow-xl overflow-hidden">
                       <div className="bg-[#e05c2a] px-5 py-3 flex justify-between items-center border-l-8 border-[#b83a10]">
                          <h2 className="text-white text-[1.1rem] font-semibold">
                             {getDiaLabelLocal(dia)}
                          </h2>
                       </div>
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-[#fff3f0] border-b-2 border-[#e05c2a]/30">
                                <th className="px-8 py-3 text-[0.8rem] font-bold text-[#b83a10] uppercase tracking-widest">Local</th>
                                <th className="px-2 py-3 text-[0.8rem] font-bold text-[#b83a10] uppercase tracking-widest text-center">Cód</th>
                                <th className="px-8 py-3 text-[0.8rem] font-bold text-[#b83a10] uppercase tracking-[8px] text-center italic">Escalados</th>
                                <th className="w-10 no-print"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e05c2a]/20">
                             {(escalaLocal.filter(l => l.categoria === "PP" && l.data === dia.id) || []).map((item, idx) => (
                                <tr key={idx} className="group hover:bg-[#fff3f0]/30 transition-all">
                                   <td className="px-8 py-2"><input type="text" value={item.local} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].local = e.target.value; setEscalaLocal(ne);} }} className="text-[0.85rem] font-semibold text-[#0a2a4a] bg-[#f5f9ff] w-full px-2 py-1 outline-none border-none" /></td>
                                   <td className="px-2 py-2"><input type="text" value={item.codigo} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].codigo = e.target.value; setEscalaLocal(ne);} }} className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[0.85rem] font-black py-1 outline-none" /></td>
                                   <td className="px-8 py-2">
                                      <div className="flex gap-2 flex-wrap">
                                         {[0,1,2,3].map(eIdx => (
                                            <input 
                                              key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ""} 
                                              placeholder="..."
                                              onChange={(e) => {
                                                 const ne = [...escalaLocal];
                                                 const itemIdx = ne.indexOf(item);
                                                 if(itemIdx > -1) {
                                                    ne[itemIdx] = { ...ne[itemIdx], escalados: [...(ne[itemIdx].escalados || [])] };
                                                    ne[itemIdx].escalados[eIdx] = e.target.value;
                                                    setEscalaLocal(ne);
                                                    verificarDuplicadoNoDia(e.target.value, dia.parent, item.local);
                                                  }
                                               }}
                                               className="flex-1 min-w-[120px] bg-white border border-[#e05c2a]/30 rounded-lg px-3 py-1.5 text-[0.85rem] font-bold text-slate-800 outline-none transition-all shadow-sm"
                                            />
                                         ))}
                                      </div>
                                   </td>
                                   <td className="px-2 no-print">
                                      <button onClick={() => {
                                         const ne = [...escalaLocal];
                                         const itemIdx = ne.indexOf(item);
                                         if(itemIdx > -1) {
                                            ne.splice(itemIdx, 1);
                                            setEscalaLocal(ne);
                                         }
                                      }} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       <button onClick={() => {
                          const ne = [...escalaLocal];
                          ne.push({categoria: "PP", data: dia.id, local: "", codigo: "61", escalados: ["", "", "", ""]});
                          setEscalaLocal(ne);
                       }} className="no-print w-full py-4 bg-[#e05c2a]/10 hover:bg-[#e05c2a]/20 text-[10px] font-black uppercase text-[#b83a10] tracking-widest transition-all">
                          + Adicionar Ponto de Pregação
                       </button>
                    </div>
                  ))}
               </div>

)}

         {activeTab === "escala-local" && (
         <div className="mt-12 space-y-8">
           <div className="bg-blue-100 border-2 border-dashed border-blue-500 rounded-[20px] p-6">
                     <h2 className="text-[#0d4a8a] text-xl font-black uppercase tracking-wider flex items-center gap-3">
                        <span className="bg-[#1a5fa0] text-white px-3 py-1 rounded-full text-sm">P</span> Portaria - Semanal
                     </h2>
                  </div>
                  {DIAS_SEMANA_PORTARIA.map(dia => (
                    <div key={dia.id} className="bg-white rounded-[20px] border border-[#1a5fa0]/30 shadow-xl overflow-hidden">
                       <div className="bg-[#1a5fa0] px-5 py-3 flex justify-between items-center border-l-8 border-[#0d4a8a]">
                          <h2 className="text-white text-[1.1rem] font-semibold">
                             {getDiaLabelLocal(dia)}
                          </h2>
                       </div>
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-[#e6f0fa] border-b-2 border-[#1a5fa0]/30">
                                <th className="px-8 py-3 text-[0.8rem] font-bold text-[#0d4a8a] uppercase tracking-widest">Local</th>
                                <th className="px-2 py-3 text-[0.8rem] font-bold text-[#0d4a8a] uppercase tracking-widest text-center">Cód</th>
                                <th className="px-8 py-3 text-[0.8rem] font-bold text-[#0d4a8a] uppercase tracking-[8px] text-center italic">Escalados</th>
                                <th className="w-10 no-print"></th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a5fa0]/20">
                             {(escalaLocal.filter(l => l.categoria === "Portaria" && l.data === dia.id) || []).map((item, idx) => (
                                <tr key={idx} className="group hover:bg-[#e6f0fa]/30 transition-all">
                                   <td className="px-8 py-2"><input type="text" value={item.local} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].local = e.target.value; setEscalaLocal(ne);} }} className="text-[0.85rem] font-semibold text-[#0a2a4a] bg-[#f5f9ff] w-full px-2 py-1 outline-none border-none" /></td>
                                   <td className="px-2 py-2"><input type="text" value={item.codigo} onChange={(e) => { const ne = [...escalaLocal]; const idx = ne.indexOf(item); if(idx>-1){ne[idx].codigo = e.target.value; setEscalaLocal(ne);} }} className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[0.85rem] font-black py-1 outline-none" /></td>
                                   <td className="px-8 py-2">
                                      <div className="flex gap-2 flex-wrap">
                                         {[0,1,2,3].map(eIdx => (
                                            <input 
                                              key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ""} 
                                              placeholder="..."
                                              onChange={(e) => {
                                                 const ne = [...escalaLocal];
                                                 const itemIdx = ne.indexOf(item);
                                                 if(itemIdx > -1) {
                                                    ne[itemIdx] = { ...ne[itemIdx], escalados: [...(ne[itemIdx].escalados || [])] };
                                                    ne[itemIdx].escalados[eIdx] = e.target.value;
                                                    setEscalaLocal(ne);
                                                    verificarDuplicadoNoDia(e.target.value, dia.parent, item.local);
                                                 }
                                              }}
                                              className="flex-1 min-w-[120px] bg-white border border-[#1a5fa0]/30 rounded-lg px-3 py-1.5 text-[0.85rem] font-bold text-slate-800 outline-none transition-all shadow-sm"
                                            />
                                         ))}
                                      </div>
                                   </td>
                                   <td className="px-2 no-print">
                                      <button onClick={() => {
                                         const ne = [...escalaLocal];
                                         const itemIdx = ne.indexOf(item);
                                         if(itemIdx > -1) {
                                            ne.splice(itemIdx, 1);
                                            setEscalaLocal(ne);
                                         }
                                      }} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                       <button onClick={() => {
                          const ne = [...escalaLocal];
                          ne.push({categoria: "Portaria", data: dia.id, local: "", codigo: "", escalados: ["", "", "", ""]});
                          setEscalaLocal(ne);
                       }} className="no-print w-full py-4 bg-[#1a5fa0]/10 hover:bg-[#1a5fa0]/20 text-[10px] font-black uppercase text-[#0d4a8a] tracking-widest transition-all">
                          + Adicionar Linha Portaria
                       </button>
                    </div>
                  ))}
               </div>
            )}

            {activeTab === "congregacoes" && (
             <div className="space-y-10">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter">Templos & Congregações</h2>
                   <button 
                     onClick={() => {
                        const novo = {nome: "Nova Congregação", endereco: "", responsavelNome: "", dataInauguracao: "", departamentos: []};
                        setCongregacoes([...congregacoes, novo]);
                        setEditingCongregacao(congregacoes.length);
                     }}
                     className="bg-[#0d4a8a] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2"
                   >
                      <Plus size={18} /> Cadastrar Templo
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {congregacoes.map((cong, idx) => {
                      const age = cong.dataInauguracao ? new Date().getFullYear() - new Date(cong.dataInauguracao).getFullYear() : "...";
                      return (
                         <div key={idx} className="bg-white rounded-[40px] border border-[#c5d8ef] shadow-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 group border-b-8 border-b-blue-600">
                            <div className="bg-[#0e3d6e] p-8 text-white relative h-40 flex flex-col justify-end">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                               <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{cong.nome}</h3>
                               <p className="text-blue-300 text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
                                  <MapPin size={12} /> {cong.endereco?.slice(0, 30)}...
                               </p>
                               <div className="absolute top-8 right-8 bg-amber-400 text-black px-4 py-1 rounded-full text-[10px] font-black shadow-lg">
                                  {age} ANOS
                               </div>
                            </div>
                            
                            <div className="p-8 space-y-6">
                               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                  <p className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-[2px] mb-2 leading-none">Obreiro Responsável</p>
                                  <p className="text-sm font-black text-blue-900 flex items-center gap-3">
                                     <Users size={16} className="text-blue-500" /> {cong.responsavelNome || "-"}
                                  </p>
                               </div>

                               <div className="space-y-4">
                                  <p className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-[2px] leading-none">Conjuntos ({cong.departamentos?.length || 0})</p>
                                  <div className="flex flex-wrap gap-2">
                                     {cong.departamentos?.slice(0, 3).map((d, dIdx) => (
                                        <span key={dIdx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black border border-blue-100 uppercase tracking-tighter">{d.nome}</span>
                                     ))}
                                     {(cong.departamentos?.length || 0) > 3 && <span className="text-slate-400 text-[10px] font-bold tracking-widest">+{(cong.departamentos?.length || 0) - 3}</span>}
                                  </div>
                                </div>

                                <button onClick={() => setEditingCongregacao(idx)} className="w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-md">
                                   Gerenciar Templo
                                </button>
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
           )}

           {activeTab === "obreiros" && (
             <div className="space-y-8">
                <div className="bg-white p-10 rounded-[40px] border border-[#c5d8ef] shadow-2xl">
                   <h2 className="text-2xl font-black text-blue-900 mb-8 italic">Cadastro de Obreiros</h2>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest px-2">Nome Completo</label>
                         <input type="text" value={novoObreiro.nome} onChange={e => setNovoObreiro({...novoObreiro, nome: e.target.value})} className="w-full bg-white border border-[#c5d8ef] rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite o nome..." />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest px-2">Cargo</label>
                         <select value={novoObreiro.cargo} onChange={e => setNovoObreiro({...novoObreiro, cargo: e.target.value})} className="w-full bg-white border border-[#c5d8ef] rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none">
                            {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                      </div>
                      <button onClick={() => {
                        if(!novoObreiro.nome) return alert("Digite o nome");
                        setObreiros([{...novoObreiro}, ...obreiros]);
                        setNovoObreiro({nome: "", cargo: "Aux.", congregacao: ""});
                      }} className="bg-[#0d4a8a] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
                         <Plus size={16} /> Adicionar
                      </button>
                   </div>

                   <div className="relative mb-6">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input type="text" value={termoBuscaObreiro} onChange={e => setTermoBuscaObreiro(e.target.value)} placeholder="Procurar obreiro ou congregação..." className="w-full bg-slate-50 border border-[#c5d8ef] rounded-3xl pl-16 pr-8 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner" />
                   </div>

                   <div className="overflow-hidden rounded-[32px] border border-slate-100">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                               <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest w-24 text-center">Cargo</th>
                               <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Nome Completo</th>
                               <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest w-16 text-right">Ações</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[#c5d8ef]">
                            {obreiros.filter(o => o.nome.toLowerCase().includes(termoBuscaObreiro.toLowerCase())).map((o, idx) => (
                               <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                                  <td className="px-8 py-3">
                                     <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black text-center">{o.cargo}</div>
                                  </td>
                                  <td className="px-8 py-3 font-bold text-slate-700">{o.nome}</td>
                                  <td className="px-8 py-3 text-right">
                                     <button onClick={() => setObreiros(obreiros.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           )}

           {activeTab === "calendario" && (
             <div className="space-y-10">
                <div className="bg-[#0e3d6e] p-8 md:p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 no-print">
                   <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center gap-6">
                        <button onClick={() => setDataVisual(addDays(dataVisual, -30))} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-black text-xl">&lt;</button>
                        <h2 className="text-4xl font-black italic uppercase tracking-widest">{format(dataVisual, "MMMM yyyy", {locale: ptBR})}</h2>
                        <button onClick={() => setDataVisual(addDays(dataVisual, 30))} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-black text-xl">&gt;</button>
                      </div>
                      <p className="text-blue-300 font-bold uppercase tracking-[3px] text-xs">Gestão Visual de Festividades e Cultos Especiais</p>
                   </div>
                   <button onClick={() => window.print()} className="bg-amber-400 text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[3px] hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center gap-4">
                      <Printer size={20} /> Imprimir Escala Mensal
                   </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                   <div className="xl:col-span-3 bg-white p-8 rounded-[40px] border border-[#c5d8ef] shadow-2xl calendar-visual">
                      <div className="grid grid-cols-7 border-b-2 border-slate-50 pb-6 mb-6">
                         {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[4px]">{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-px bg-[#fff9e8] text-[#1a5fa0] rounded-[32px] overflow-hidden border border-slate-100">
                         {(() => {
                            const start = startOfWeek(startOfMonth(dataVisual), {weekStartsOn: 1});
                            const days = Array.from({length: 42}).map((_, i) => addDays(start, i));
                            return days.map((day, i) => {
                               const isSameMonth = day.getMonth() === dataVisual.getMonth();
                               const dayEvs = eventos.filter(ev => {
                                  try {
                                     let d=0, m=0, y=0;
                                     if (ev.data.includes("/")) {
                                        [d, m, y] = ev.data.split("/").map(Number);
                                     } else {
                                        [y, m, d] = ev.data.split("-").map(Number);
                                     }
                                     return d === day.getDate() && m === (day.getMonth()+1) && y === day.getFullYear();
                                  } catch { return false; }
                               });
                               return (
                                  <div key={i} className={`min-h-[140px] p-4 flex flex-col gap-2 transition-all ${isSameMonth ? "bg-white hover:bg-blue-50/20" : "bg-slate-50/50 opacity-20"}`}>
                                     <span className={`text-xs font-black ${isSameMonth ? "text-slate-800" : "text-slate-300"}`}>{day.getDate()}</span>
                                     <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                                        {dayEvs.map((ev, eIdx) => (
                                           <button 
                                             key={eIdx} 
                                             onClick={() => setEditingEvento(ev)}
                                             className="w-full text-left text-[8px] font-black bg-[#0d4a8a] text-white p-1.5 rounded-lg shadow-sm border-l-4 border-amber-400 truncate hover:bg-blue-700 transition-colors"
                                           >
                                             {ev.descricao}
                                           </button>
                                         ))}
                                     </div>
                                  </div>
                               );
                            });
                         })()}
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[40px] border border-[#c5d8ef] shadow-2xl no-print space-y-8">
                      <h3 className="text-sm font-black text-blue-900 uppercase italic border-b border-slate-100 pb-4 tracking-widest">Festividades</h3>
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                         {eventos.filter(ev => {
                            try {
                               let d=0, m=0, y=0;
                               if (ev.data.includes("/")) {
                                  [d, m, y] = ev.data.split("/").map(Number);
                               } else {
                                  [y, m, d] = ev.data.split("-").map(Number);
                               }
                               return m === (dataVisual.getMonth()+1) && y === dataVisual.getFullYear();
                            } catch { return false; }
                         }).sort((a,b) => a.data.localeCompare(b.data)).map((ev, idx) => (
                             <div 
                               key={idx} 
                               onClick={() => setEditingEvento(ev)}
                               className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 relative group overflow-hidden cursor-pointer hover:bg-white hover:shadow-lg transition-all"
                             >
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-2">
                                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{ev.data}</span>
                                   <button onClick={(e) => { e.stopPropagation(); setEventos(eventos.filter(item => item.id !== ev.id)); }} className="text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                                </div>
                                <p className="text-xs font-black text-slate-800 leading-tight mb-2">{ev.descricao}</p>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {ev.congregacao || "Geral"}</span>
                             </div>
                         ))}
                      </div>

                      <div className="pt-8 border-t border-slate-100 space-y-4">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Novo Evento</p>
                         <input type="text" placeholder="DD/MM/AAAA" value={novoEvento.data} onChange={e => setNovoEvento({...novoEvento, data: e.target.value})} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
                         <input type="text" placeholder="Descrição da festa..." value={novoEvento.descricao} onChange={e => setNovoEvento({...novoEvento, descricao: e.target.value})} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
                         <button onClick={() => {
                            if(!novoEvento.data || !novoEvento.descricao) return alert("Preecha os campos!");
                            setEventos([{...novoEvento, id: Math.random().toString(36).substr(2,9)}, ...eventos]);
                            setNovoEvento({data:"", descricao:"", cc:"", congregacao:""});
                         }} className="w-full bg-[#0d4a8a] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Adicionar</button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === "config" && (
             <div className="space-y-10">
                <div className="bg-[#0e3d6e] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                   <div className="relative z-10 flex flex-col gap-4">
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Painel de Sincronização</h2>
                      <p className="text-blue-300 font-bold text-sm leading-relaxed max-w-lg">Mantenha sua base de dados atualizada entre o painel local e a planilha do Google Sheets.</p>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={saveData} disabled={saving} className="bg-amber-400 text-black px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[2px] hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center gap-4">
                         {saving ? <RefreshCw className="animate-spin" /> : <Save />} {saving ? "Salvando..." : "Sincronizar Nuvem"}
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="bg-white p-10 rounded-[40px] border border-[#c5d8ef] shadow-xl">
                      <h3 className="text-lg font-black text-blue-900 mb-6 uppercase tracking-widest flex items-center gap-3 italic"><Settings size={22} className="text-blue-500" /> Automação</h3>
                      <button onClick={aplicarRegrasGerais} className="w-full bg-[#0d4a8a] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[3px] hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-4">
                         🌀 Executar Robô de Escala
                      </button>
                   </div>
                </div>
             </div>
           )}
        </main>
      </div>

      {/* MODAL EDIÇÃO CONGREGAÇÃO */}
      <AnimatePresence>
        {editingCongregacao !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#071f37]/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[60px] w-full max-w-5xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
               <div className="bg-[#0e3d6e] py-12 px-14 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                  <div className="relative z-10">
                     <p className="text-[11px] font-black uppercase text-blue-300 tracking-[6px] mb-3 leading-none italic">Gestão Administrativa</p>
                     <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{congregacoes[editingCongregacao]?.nome}</h2>
                  </div>
                  <button onClick={() => setEditingCongregacao(null)} className="relative z-10 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-4xl shadow-xl hover:rotate-90 duration-500">&times;</button>
               </div>

               <div className="flex-1 overflow-y-auto p-14 space-y-14 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                     <div className="space-y-10">
                        <section className="space-y-8">
                           <h4 className="text-[#0d4a8a] font-black text-xs uppercase tracking-[4px] border-b-4 border-blue-50 pb-5 italic flex items-center gap-3"><Church size={18} /> Dados Gerais do Templo</h4>
                           <div className="space-y-6">
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Nome da Congregação</label>
                                 <input type="text" value={congregacoes[editingCongregacao]?.nome} onChange={e => {
                                    const nc = [...congregacoes]; nc[editingCongregacao].nome = e.target.value; setCongregacoes(nc);
                                 }} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[28px] px-8 py-5 font-black text-[#0d4a8a] outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner text-lg" />
                              </div>
                              <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Responsável (Obreiro)</label>
                                 <input list="lista-obreiros" type="text" value={congregacoes[editingCongregacao]?.responsavelNome} onChange={e => {
                                    const nc = [...congregacoes]; nc[editingCongregacao].responsavelNome = e.target.value; setCongregacoes(nc);
                                 }} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[24px] px-8 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" placeholder="Ex: Pr. Fulano de Tal" />
                              </div>
                           </div>
                        </section>
                     </div>
                  </div>
               </div>

               <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest px-14">
                  <span>* Alterações pendentes de sincronização</span>
                  <button onClick={() => setEditingCongregacao(null)} className="bg-[#0d4a8a] text-white px-12 py-4 rounded-full shadow-2xl hover:scale-105 transition-all">Concluir Edição</button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="mt-24 border-t border-[#c5d8ef] py-24 bg-white no-print">
         <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-12">
            <div className="flex items-center gap-20">
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/IEADPE.png" className="w-24 h-24 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-1000" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-center">
               <div className="space-y-3">
                  <p className="text-[11px] font-black text-[#0d4a8a] uppercase tracking-[6px] opacity-40">Gestão Eclesiástica</p>
                  <p className="text-lg font-black text-[#0d4a8a]/70 italic leading-none">IEADPE Filial Araçoiaba</p>
               </div>
               <div className="space-y-3">
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[6px]">Tecnologia & Fé</p>
                  <p className="text-lg font-black text-slate-400 italic leading-none">© 2026 Portal do Obreiro</p>
               </div>
            </div>
         </div>
      </footer>

      {/* MODAL EDIÇÃO EVENTO */}
      <AnimatePresence>
        {editingEvento !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#071f37]/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[50px] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20">
               <div className="bg-[#0e4b8a] py-10 px-12 text-white flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                     <p className="text-[10px] font-black uppercase text-blue-200 tracking-[5px] mb-2">Festividade</p>
                     <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Editar Evento</h2>
                  </div>
                  <button onClick={() => setEditingEvento(null)} className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-2xl shadow-lg">&times;</button>
               </div>

               <div className="p-12 space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Data (DD/MM/AAAA)</label>
                     <input type="text" value={editingEvento.data} onChange={e => setEditingEvento({...editingEvento, data: e.target.value})} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-6 py-4 font-black text-blue-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Descrição do Evento</label>
                     <textarea rows={3} value={editingEvento.descricao} onChange={e => setEditingEvento({...editingEvento, descricao: e.target.value})} className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                     <button onClick={() => { setEventos(eventos.map(ev => ev.id === editingEvento.id ? editingEvento : ev)); setEditingEvento(null); }} className="flex-1 bg-[#0d4a8a] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Salvar</button>
                     <button onClick={() => { if(confirm("Excluir?")) { setEventos(eventos.filter(ev => ev.id !== editingEvento.id)); setEditingEvento(null); } }} className="bg-red-50 text-red-500 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Excluir</button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <datalist id="lista-obreiros">
         {obreiros.map((o, idx) => (
            <option key={idx} value={`${o.cargo} ${o.nome}`} />
         ))}
      </datalist>

      {/* MODAL CONFLITO DE OBREIROS */}
      <AnimatePresence>
        {duplicateModal?.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[16px] p-7 max-w-[420px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-t-5 border-[#e05c2a]">
               <div className="text-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="text-[#b83a10] text-lg font-black mb-3">Obreiro já escalado neste dia!</h3>
                  <p className="text-slate-800 font-bold mb-2">{duplicateModal.worker}</p>
                  <p className="text-slate-500 text-sm bg-[#fff3f0] px-4 py-3 rounded-lg border-l-4 border-[#e05c2a] mb-5">
                     Já está escalado em <strong>{duplicateModal.congregacao}</strong> neste mesmo dia.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                     <button 
                       onClick={() => setDuplicateModal(null)}
                       className="bg-[#0d4a8a] text-white px-6 py-3 rounded-full font-black text-sm hover:bg-blue-700 transition-all"
                     >
                        ✅ Manter assim mesmo
                     </button>
                      <button 
                        onClick={() => setDuplicateModal(null)}
                        className="bg-[#e05c2a] text-white px-6 py-3 rounded-full font-black text-sm hover:bg-orange-600 transition-all"
                      >
                         ❌ Remover desta vaga
                      </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          .no-print { display: none !important; }
          body { background: white !important; font-family: "Inter", sans-serif !important; }
          .container-app { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .rounded-[50px], .rounded-[40px], .rounded-[32px] { border-radius: 0 !important; }
          .shadow-xl, .shadow-2xl, .shadow-lg { box-shadow: none !important; }
          .border { border: 1px solid #eee !important; }
          .divide-y > * + * { border-top-width: 1px !important; border-color: #eee !important; }
          input { background: transparent !important; border: none !important; padding-left: 0 !important; }
          .bg-slate-50 { background: #fafafa !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th { color: #000 !important; border-bottom: 2px solid #000 !important; padding: 10px 5px !important; }
          td { padding: 8px 5px !important; border-bottom: 1px solid #f0f0f0 !important; }
          h2 { color: #000 !important; margin-top: 20px !important; border-bottom: 2px solid #000 !important; padding-bottom: 5px !important; }
          .day-section { page-break-inside: avoid; margin-bottom: 30px !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        input::placeholder { font-style: italic; opacity: 0.5; }
        input:focus { transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
