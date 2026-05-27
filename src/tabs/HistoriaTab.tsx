import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DIAS_SEMANA_OFICIAL } from '../constants';
import type { EscalaOficialStore, EscalaLocalItem } from '../types';
import { Search } from 'lucide-react';

interface Props {
  escalaOficialStore: EscalaOficialStore;
  escalaLocalStore: EscalaLocalItem[];
  congregacoes: { nome: string }[];
  obreiros: { nome: string; cargo: string }[];
}

export function HistoriaTab({ escalaOficialStore, escalaLocalStore, congregacoes, obreiros }: Props) {
  const [busca, setBusca] = useState('');
  const [filtroCong, setFiltroCong] = useState('');
  const [semanaFiltro, setSemanaFiltro] = useState('');

  const semanas = Object.keys(escalaOficialStore).sort().reverse();

  const todasEscalas = Object.entries(escalaOficialStore).flatMap(([week, dias]) =>
    Object.entries(dias).flatMap(([diaId, items]) =>
      items.map(item => ({
        semana: week,
        dia: DIAS_SEMANA_OFICIAL.find(d => d.id === diaId)?.label || diaId,
        congregacao: item.congregacao,
        codigo: item.codigo,
        escalados: item.escalados.filter(Boolean).join(', ')
      }))
    )
  );

  const locais = escalaLocalStore.map(item => ({
    semana: item.dataInicio || '—',
    categoria: item.categoria,
    local: item.local,
    codigo: item.codigo,
    escalados: item.escalados.filter(Boolean).join(', ')
  }));

  const filtrados = todasEscalas.filter(e =>
    (e.congregacao.toLowerCase().includes(busca.toLowerCase()) || e.escalados.toLowerCase().includes(busca.toLowerCase())) &&
    (!filtroCong || e.congregacao === filtroCong) &&
    (!semanaFiltro || e.semana === semanaFiltro)
  );

  const locaisFiltrados = locais.filter(e =>
    (e.local.toLowerCase().includes(busca.toLowerCase()) || e.escalados.toLowerCase().includes(busca.toLowerCase())) &&
    (!semanaFiltro || e.semana === semanaFiltro)
  );

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="bg-[#0e3d6e] p-5 md:p-10 rounded-[24px] md:rounded-[40px] text-white shadow-md md:shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3 md:gap-4">
            📜 Histórico
          </h2>
          <p className="text-blue-300 font-bold text-xs md:text-sm mt-2">Consulte todas as escalas registradas.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 no-print">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white border border-[#c5d8ef] rounded-full pl-10 md:pl-12 pr-4 md:pr-6 py-2.5 md:py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-xs md:text-sm" />
        </div>
        <select value={filtroCong} onChange={e => setFiltroCong(e.target.value)}
          className="bg-white border border-[#c5d8ef] rounded-full px-4 md:px-6 py-2.5 md:py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-xs md:text-sm">
          <option value="">Todas cong.</option>
          {congregacoes.map((c, i) => <option key={i} value={c.nome}>{c.nome}</option>)}
        </select>
        {semanas.length > 0 && (
          <select value={semanaFiltro} onChange={e => setSemanaFiltro(e.target.value)}
            className="bg-white border border-[#c5d8ef] rounded-full px-4 md:px-6 py-2.5 md:py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-xs md:text-sm">
            <option value="">Todas semanas</option>
            {semanas.map(s => <option key={s} value={s}>{format(new Date(s + 'T03:00:00'), "dd/MM/yyyy", { locale: ptBR })}</option>)}
          </select>
        )}
      </div>

      {/* Escala Oficial */}
      <div className="bg-white rounded-[16px] md:rounded-[32px] border border-[#c5d8ef] shadow-sm md:shadow-xl overflow-hidden">
        <div className="bg-[#0d4a8a] px-4 md:px-8 py-3 md:py-5">
          <h3 className="text-white font-black uppercase tracking-wider text-[11px] md:text-sm">📆 Oficial ({filtrados.length})</h3>
        </div>
        {filtrados.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-slate-400 font-bold text-xs">Nenhum registro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Semana</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Dia</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Cong.</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Cód</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Escalados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5d8ef]">
                {filtrados.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-6 py-2 md:py-3 text-[8px] md:text-[0.7rem] font-mono text-slate-400 whitespace-nowrap">{e.semana}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 text-[9px] md:text-[0.8rem] font-semibold text-slate-600 whitespace-nowrap">{e.dia}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3 font-bold text-slate-800 text-[9px] md:text-sm whitespace-nowrap">{e.congregacao}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3">
                      <span className="bg-[#fff9e8] text-[#1a5fa0] px-1.5 md:px-3 py-0.5 md:py-1 rounded text-[9px] md:text-[0.75rem] font-black">{e.codigo}</span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 font-bold text-slate-700 text-[9px] md:text-sm">{e.escalados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escala Local */}
      <div className="bg-white rounded-[16px] md:rounded-[32px] border border-[#c5d8ef] shadow-sm md:shadow-xl overflow-hidden">
        <div className="bg-[#1a5fa0] px-4 md:px-8 py-3 md:py-5">
          <h3 className="text-white font-black uppercase tracking-wider text-[11px] md:text-sm">📋 Local ({locaisFiltrados.length})</h3>
        </div>
        {locaisFiltrados.length === 0 ? (
          <div className="p-8 md:p-12 text-center text-slate-400 font-bold text-xs">Nenhum registro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Semana</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Cat.</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Local</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Cód</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-[9px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-wider whitespace-nowrap">Escalados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5d8ef]">
                {locaisFiltrados.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-3 md:px-6 py-2 md:py-3 text-[8px] md:text-[0.7rem] font-mono text-slate-400 whitespace-nowrap">{e.semana}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3">
                      <span className={`text-[8px] md:text-[0.7rem] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-white ${
                        e.categoria === 'PP' ? 'bg-orange-500' : e.categoria === 'Portaria' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}>{e.categoria}</span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 font-bold text-slate-800 text-[9px] md:text-sm whitespace-nowrap">{e.local}</td>
                    <td className="px-3 md:px-6 py-2 md:py-3">
                      <span className="bg-[#fff9e8] text-[#1a5fa0] px-1.5 md:px-3 py-0.5 md:py-1 rounded text-[9px] md:text-[0.75rem] font-black">{e.codigo || '—'}</span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-3 font-bold text-slate-700 text-[9px] md:text-sm">{e.escalados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
