import { Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CARGOS } from '../constants';
import type { Congregacao, Obreiro } from '../types';

interface Props {
  obreiros: Obreiro[];
  congregacoes: Congregacao[];
  onUpdate: (items: Obreiro[]) => void;
}

export function ObreirosTab({ obreiros, congregacoes, onUpdate }: Props) {
  const [novo, setNovo] = useState({ nome: '', cargo: 'Aux.', congregacao: '' });
  const [busca, setBusca] = useState('');

  const filtrados = obreiros.filter(o => o.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-white p-4 md:p-10 rounded-[24px] md:rounded-[40px] border border-[#c5d8ef] shadow-sm md:shadow-2xl">
        <h2 className="text-lg md:text-2xl font-black text-blue-900 mb-4 md:mb-8 italic">Cadastro de Obreiros</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4 items-end bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-3xl border border-slate-100 mb-6 md:mb-10">
          <div className="md:col-span-2 space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider px-2">Nome</label>
            <input type="text" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm" placeholder="Digite o nome..." />
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider px-2">Cargo</label>
            <select value={novo.cargo} onChange={e => setNovo({ ...novo, cargo: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-800 outline-none text-xs md:text-sm">
              {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider px-2">Congregação</label>
            <select value={novo.congregacao} onChange={e => setNovo({ ...novo, congregacao: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-xl md:rounded-2xl px-4 md:px-5 py-2.5 md:py-3 font-bold text-slate-800 outline-none text-xs md:text-sm">
              <option value="">Selecione...</option>
              {congregacoes.map((c, i) => <option key={i} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <button onClick={() => {
            if (!novo.nome) return;
            onUpdate([{ ...novo }, ...obreiros]);
            setNovo({ nome: '', cargo: 'Aux.', congregacao: '' });
          }} className="bg-[#0d4a8a] text-white py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 mt-1 md:mt-0">
            <Plus size={14} /> Adicionar
          </button>
        </div>

        <div className="relative mb-4 md:mb-6">
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Procurar obreiro..."
            className="w-full bg-slate-50 border border-[#c5d8ef] rounded-full pl-10 md:pl-16 pr-4 md:pr-8 py-3 md:py-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner text-xs md:text-sm" />
        </div>

        {/* Desktop: tabela */}
        <div className="hidden md:block overflow-hidden rounded-[32px] border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 md:px-8 py-3 md:py-4 text-[0.75rem] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider w-24 text-center">Cargo</th>
                <th className="px-6 md:px-8 py-3 md:py-4 text-[0.75rem] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider">Nome</th>
                <th className="px-6 md:px-8 py-3 md:py-4 text-[0.75rem] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider">Congregação</th>
                <th className="px-6 md:px-8 py-3 md:py-4 text-[0.75rem] md:text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider w-16 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5d8ef]">
              {filtrados.map((o, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 md:px-8 py-2.5 md:py-3">
                    <div className="bg-blue-100 text-blue-600 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-black text-center">{o.cargo}</div>
                  </td>
                  <td className="px-6 md:px-8 py-2.5 md:py-3 font-bold text-slate-700 text-xs md:text-sm">{o.nome}</td>
                  <td className="px-6 md:px-8 py-2.5 md:py-3">
                    <span className={`text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full ${o.congregacao ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>
                      {o.congregacao || '—'}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-2.5 md:py-3 text-right">
                    <button onClick={() => onUpdate(obreiros.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all p-1"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <div className="block md:hidden space-y-2">
          {filtrados.map((o, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[8px] font-black shrink-0">{o.cargo}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-700 truncate">{o.nome}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{o.congregacao || 'Sem congregação'}</p>
              </div>
              <button onClick={() => onUpdate(obreiros.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 p-1 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
          {filtrados.length === 0 && (
            <p className="text-center text-xs text-slate-400 font-bold py-8">Nenhum obreiro encontrado</p>
          )}
        </div>
      </div>
    </div>
  );
}
