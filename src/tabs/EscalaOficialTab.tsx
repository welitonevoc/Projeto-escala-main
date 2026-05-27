import { RefreshCw, Printer } from 'lucide-react';
import { DIAS_SEMANA_OFICIAL, CODIGOS_TRABALHO, DIAS_OFFSET } from '../constants';
import { addDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EscalaOficialData } from '../types';

interface Props {
  escalaOficial: EscalaOficialData;
  dataInicio: string;
  obreiros: { nome: string; cargo: string }[];
  onUpdate: (data: EscalaOficialData) => void;
  onDuplicateCheck: (valor: string, diaId: string, local: string) => void;
}

export function EscalaOficialTab({ escalaOficial, dataInicio, obreiros, onUpdate, onDuplicateCheck }: Props) {
  const getFullDateStr = (diaId: string) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[diaId] || 0);
    return format(date, "EEEE - pppp ' / ' dd ' de ' MMMM yyyy", { locale: ptBR }).replace("Noite ", "Noite").replace("Manhã ", "Manhã");
  };

  return (
    <div className="space-y-10">
      {/* Códigos */}
      <div className="bg-white p-2 rounded-2xl border border-[#c5d8ef] shadow-sm overflow-x-auto no-print">
        <div className="flex gap-1 p-2 min-w-max">
          {CODIGOS_TRABALHO.map(c => (
            <span key={c} className="text-[8px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap uppercase italic tracking-tighter">{c}</span>
          ))}
        </div>
      </div>

      {DIAS_SEMANA_OFICIAL.map(dia => (
        <div key={dia.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden">
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
                  <td className="px-8 py-2">
                    <input
                      type="text" value={item.congregacao}
                      onChange={e => immutableUpdate(dia.id, idx, { congregacao: e.target.value })}
                      className="bg-transparent border-none text-[11px] font-black text-slate-700 w-full focus:ring-0 p-0" />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="text" value={item.codigo}
                      onChange={e => immutableUpdate(dia.id, idx, { codigo: e.target.value })}
                      className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[11px] font-black py-1 outline-none" />
                  </td>
                  <td className="px-8 py-2">
                    <div className="flex gap-2">
                      {[0, 1, 2].map(eIdx => (
                        <input
                          key={eIdx} list="lista-obreiros"
                          value={item.escalados[eIdx] || ''}
                          onChange={e => {
                            const newEscalados = [...item.escalados];
                            newEscalados[eIdx] = e.target.value;
                            immutableUpdate(dia.id, idx, { escalados: newEscalados });
                            onDuplicateCheck(e.target.value, dia.id, item.congregacao);
                          }}
                          className="flex-1 min-w-[120px] bg-slate-50 border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                      ))}
                    </div>
                  </td>
                  <td className="px-2 no-print">
                    <button onClick={() => removeRow(dia.id, idx)} className="text-red-300 hover:text-red-500 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => addRow(dia.id)} className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase text-slate-400 tracking-widest transition-all">
            + Adicionar Linha
          </button>
        </div>
      ))}
    </div>
  );

  function immutableUpdate(diaId: string, idx: number, partial: Partial<typeof escalaOficial[string][number]>) {
    const updated = { ...escalaOficial };
    if (!updated[diaId]) updated[diaId] = [];
    updated[diaId] = updated[diaId].map((item, i) => i === idx ? { ...item, ...partial } : item);
    onUpdate(updated);
  }

  function removeRow(diaId: string, idx: number) {
    const updated = { ...escalaOficial };
    if (updated[diaId]) {
      updated[diaId] = updated[diaId].filter((_, i) => i !== idx);
    }
    onUpdate(updated);
  }

  function addRow(diaId: string) {
    const updated = { ...escalaOficial };
    if (!updated[diaId]) updated[diaId] = [];
    updated[diaId] = [...updated[diaId], { congregacao: '', codigo: '04', escalados: ['', '', ''] }];
    onUpdate(updated);
  }
}
