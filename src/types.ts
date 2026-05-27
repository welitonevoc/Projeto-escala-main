export interface Obreiro {
  nome: string;
  cargo: string;
  congregacao: string;
}

export interface Departamento {
  id: string;
  tipo: string;
  nome: string;
  dataCriacao: string;
  dirigente: string;
  viceDirigente: string;
  secretaria: string;
  viceSecretaria: string;
}

export interface Congregacao {
  nome: string;
  endereco: string;
  responsavelNome: string;
  dataInauguracao: string;
  departamentos: Departamento[];
}

export interface EscalaItem {
  congregacao: string;
  codigo: string;
  escalados: string[];
}

export interface EscalaOficialData {
  [dia: string]: EscalaItem[];
}

export interface EscalaLocalItem {
  dataInicio?: string;
  categoria: string;
  data: string;
  local: string;
  codigo: string;
  escalados: string[];
}

export type EscalaOficialStore = Record<string, EscalaOficialData>;

export interface ConjuntoConvidado {
  nome: string;
  congregacao: string;
}

export interface Evento {
  id: string;
  data: string;
  descricao: string;
  cc: string;
  congregacao: string;
  programacaoEntregue: boolean;
  conjuntosConvidados: ConjuntoConvidado[];
  cantoresConvidados: string;
  imagemAnexo?: string;
}

export interface TipoCulto {
  nome: string;
  codigo: string;
}

export interface RegraCulto {
  congregacao: string;
  dia: string;
  regraSemana: string[];
}

export interface DiaSemana {
  id: string;
  label: string;
  filtros?: string[];
  parent?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface DuplicateData {
  isOpen: boolean;
  worker: string;
  congregacao: string;
  diaLabel: string;
}
