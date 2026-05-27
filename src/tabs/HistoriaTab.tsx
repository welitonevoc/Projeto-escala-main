import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DIAS_SEMANA_OFICIAL, DIAS_OFFSET } from '../constants';
import type { EscalaOficialData, EscalaLocalItem } from '../types';
import { Search } from 'lucide-react';

interface Props {
  escalaOficial: EscalaOficialData;
  escalaLocal: EscalaLocalItem[];
  congregacoes: { nome: string }[];
  obreiros: { nome: string; cargo: string }[];
}

export function HistoriaTab({ escalaOficial, escalaLocal, congregacoes, obreiros }: Props) {
  const [busca, setBusca] = useState('');
  const [filtroCong, setFiltroCong] = useState('');

  const todasEscalas = Object.entries(escalaOficial).flatMap(([diaId, items]) =>
    items.map(item => ({
      dia: DIAS_SEMANA_OFICIAL.find(d => d.id === diaId)?.label || diaId,
      congregacao: item.congregacao,
      codigo: item.codigo,
      escalados: item.escalados.filter(Boolean).join(', ')
    }))
  );

  const locais = escalaLocal.map(item => ({
    categoria: item.categoria,
    local: item.local,
    codigo: item.codigo,
    escalados: item.escalados.filter(Boolean).join(', ')
  }));

  const filtrados = todasEscalas.filter(e =>
    (e.congregacao.toLowerCase().includes(busca.toLowerCase()) || e.escalados.toLowerCase().includes(busca.toLowerCase())) &&
    (!filtroCong || e.congregacao === filtroCong)
  );

  return (
    <div className="space-y-10">
      <div className="bg-[#0e3d6e] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
            📜 Histórico de Escalas
          </h2>
          <p className="text-blue-300 font-bold text-sm mt-3">Consulte todas as escalas registradas no sistema.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 no-print">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por congregação ou obreiro..."
            className="w-full bg-white border border-[#c5d8ef] rounded-full pl-12 pr-6 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <select value={filtroCong} onChange={e => setFiltroCong(e.target.value)}
          className="bg-white border border-[#c5d8ef] rounded-full px-6 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
          <option value="">Todas as congregações</option>
          {congregacoes.map((c, i) => <option key={i} value={c.nome}>{c.nome}</option>)}
        </select>
      </div>

      {/* Escala Oficial */}
      <div className="bg-white rounded-[32px] border border-[#c5d8ef] shadow-xl overflow-hidden">
        <div className="bg-[#0d4a8a] px-8 py-5">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">📆 Escala Oficial ({filtrados.length} registros)</h3>
        </div>
        {filtrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">Nenhum registro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Dia</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Congregação</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Cód</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Escalados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5d8ef]">
                {filtrados.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-[0.8rem] font-semibold text-slate-600">{e.dia}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{e.congregacao}</td>
                    <td className="px-6 py-3">
                      <span className="bg-[#fff9e8] text-[#1a5fa0] px-3 py-1 rounded text-[0.75rem] font-black">{e.codigo}</span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700 text-sm">{e.escalados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escala Local */}
      <div className="bg-white rounded-[32px] border border-[#c5d8ef] shadow-xl overflow-hidden">
        <div className="bg-[#1a5fa0] px-8 py-5">
          <h3 className="text-white font-black uppercase tracking-widest text-sm">📋 Escala Local ({locais.length} registros)</h3>
        </div>
        {locais.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold">Nenhum registro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Local</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Cód</th>
                  <th className="px-6 py-4 text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Escalados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5d8ef]">
                {locais.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3">
                      <span className={`text-[0.7rem] font-black px-3 py-1 rounded-full text-white ${
                        e.categoria === 'PP' ? 'bg-orange-500' : e.categoria === 'Portaria' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}>{e.categoria}</span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-800">{e.local}</td>
                    <td className="px-6 py-3">
                      <span className="bg-[#fff9e8] text-[#1a5fa0] px-3 py-1 rounded text-[0.75rem] font-black">{e.codigo || '—'}</span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700 text-sm">{e.escalados}</td>
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
