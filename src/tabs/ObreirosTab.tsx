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

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[40px] border border-[#c5d8ef] shadow-2xl">
        <h2 className="text-2xl font-black text-blue-900 mb-8 italic">Cadastro de Obreiros</h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest px-2">Nome Completo</label>
            <input type="text" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Digite o nome..." />
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest px-2">Cargo</label>
            <select value={novo.cargo} onChange={e => setNovo({ ...novo, cargo: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none">
              {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest px-2">Congregação</label>
            <select value={novo.congregacao} onChange={e => setNovo({ ...novo, congregacao: e.target.value })}
              className="w-full bg-white border border-[#c5d8ef] rounded-2xl px-5 py-3 font-bold text-slate-800 outline-none">
              <option value="">Selecione...</option>
              {congregacoes.map((c, i) => <option key={i} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
          <button onClick={() => {
            if (!novo.nome) return;
            onUpdate([{ ...novo }, ...obreiros]);
            setNovo({ nome: '', cargo: 'Aux.', congregacao: '' });
          }} className="bg-[#0d4a8a] text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
            <Plus size={16} /> Adicionar
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Procurar obreiro ou congregação..."
            className="w-full bg-slate-50 border border-[#c5d8ef] rounded-3xl pl-16 pr-8 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner" />
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest w-24 text-center">Cargo</th>
                <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Nome Completo</th>
                <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest">Congregação</th>
                <th className="px-8 py-4 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-widest w-16 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5d8ef]">
              {obreiros.filter(o => o.nome.toLowerCase().includes(busca.toLowerCase())).map((o, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-3">
                    <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black text-center">{o.cargo}</div>
                  </td>
                  <td className="px-8 py-3 font-bold text-slate-700">{o.nome}</td>
                  <td className="px-8 py-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${o.congregacao ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-300'}`}>
                      {o.congregacao || '—'}
                    </span>
                  </td>
                  <td className="px-8 py-3 text-right">
                    <button onClick={() => onUpdate(obreiros.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
