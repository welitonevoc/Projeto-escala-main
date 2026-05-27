import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [diaAtivo, setDiaAtivo] = useState(0);
  const touchStartX = useRef(0);

  const getFullDateStr = (diaId: string) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[diaId] || 0);
    return format(date, "EEEE - dd 'de' MMMM yyyy", { locale: ptBR }).replace("Noite ", "Noite").replace("Manhã ", "Manhã");
  };

  const getDayLabel = (dia: typeof DIAS_SEMANA_OFICIAL[0]) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[dia.id] || 0);
    return format(date, "dd/MM");
  };

  const activeDay = DIAS_SEMANA_OFICIAL[diaAtivo];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && diaAtivo > 0) setDiaAtivo(prev => prev - 1);
      else if (diff < 0 && diaAtivo < DIAS_SEMANA_OFICIAL.length - 1) setDiaAtivo(prev => prev + 1);
    }
  }, [diaAtivo]);

  return (
    <div className="space-y-4 md:space-y-10" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Códigos */}
      <div className="bg-white p-2 rounded-2xl border border-[#c5d8ef] shadow-sm overflow-x-auto no-print">
        <div className="flex gap-1 p-1 min-w-max">
          {CODIGOS_TRABALHO.map(c => (
            <span key={c} className="text-[7px] md:text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 md:px-2 py-1 rounded whitespace-nowrap uppercase italic tracking-tighter">{c}</span>
          ))}
        </div>
      </div>

      {/* Mobile: day pills + swipeable day */}
      <div className="md:hidden">
        {/* Day selector pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
          {DIAS_SEMANA_OFICIAL.map((dia, idx) => (
            <button
              key={dia.id}
              onClick={() => setDiaAtivo(idx)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                idx === diaAtivo
                  ? 'bg-[#0d4a8a] text-white shadow-md'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="block">{dia.label.split(' - ')[0].slice(0, 3)}</span>
              <span className={`block text-[7px] mt-0.5 ${idx === diaAtivo ? 'text-blue-200' : 'text-slate-400'}`}>
                {dia.label.includes('Manhã') ? 'Manhã' : dia.label.includes('Tarde') ? 'Tarde' : 'Noite'}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-white rounded-2xl border border-[#c5daf0] shadow-sm overflow-hidden">
              <div className="bg-[#0d4a8a] px-4 py-3 border-l-8 border-[#1a70b8]">
                <h2 className="text-white text-sm font-bold">{activeDay.label}</h2>
                <p className="text-[9px] text-blue-200 mt-0.5">{getFullDateStr(activeDay.id)}</p>
              </div>

              <div className="divide-y divide-slate-100">
                {(escalaOficial[activeDay.id] || []).map((item, idx) => (
                  <div key={idx} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={item.congregacao}
                        onChange={e => immutableUpdate(activeDay.id, idx, { congregacao: e.target.value })}
                        className="flex-1 bg-transparent border-none text-xs font-black text-slate-700 outline-none p-0" placeholder="Congregação" />
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Cód</span>
                        <input type="text" value={item.codigo}
                          onChange={e => immutableUpdate(activeDay.id, idx, { codigo: e.target.value })}
                          className="w-9 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[10px] font-black py-1 outline-none" />
                      </div>
                      <button onClick={() => removeRow(activeDay.id, idx)} className="text-red-300 hover:text-red-500 p-1 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(eIdx => (
                        <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ''} placeholder="..."
                          onChange={e => {
                            const newEscalados = [...item.escalados];
                            newEscalados[eIdx] = e.target.value;
                            immutableUpdate(activeDay.id, idx, { escalados: newEscalados });
                            onDuplicateCheck(e.target.value, activeDay.id, item.congregacao);
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => addRow(activeDay.id)}
                className="w-full py-3 bg-[#1a70b820] hover:bg-[#1a70b840] text-[9px] font-black uppercase text-slate-400 tracking-wider transition-all flex items-center justify-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </div>

            {/* Swipe hint */}
            <div className="flex justify-center gap-2 mt-3">
              {DIAS_SEMANA_OFICIAL.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setDiaAtivo(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === diaAtivo ? 'bg-[#0d4a8a] w-4' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: tabela completa */}
      <div className="hidden md:block space-y-10">
        {DIAS_SEMANA_OFICIAL.map(dia => (
          <div key={dia.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden">
            <div className="bg-[#0d4a8a] px-5 py-3 flex items-center border-l-8 border-[#1a70b8]">
              <h2 className="text-white text-xl font-semibold">{dia.label}</h2>
              <span className="ml-3 text-xs text-blue-200 font-medium opacity-80">{getFullDateStr(dia.id)}</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#e6f0fa] border-b-2 border-[#a8c8e8]">
                  <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider">Congregação</th>
                  <th className="px-2 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider text-center">Cód</th>
                  <th className="px-8 py-3 text-[0.85rem] font-bold text-[#0d3d7a] uppercase tracking-wider text-center italic">Escalados</th>
                  <th className="w-10 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5d8ef]">
                {(escalaOficial[dia.id] || []).map((item, idx) => (
                  <tr key={idx} className="group hover:bg-[#e6f0fa]/30 transition-all">
                    <td className="px-8 py-2">
                      <input type="text" value={item.congregacao}
                        onChange={e => immutableUpdate(dia.id, idx, { congregacao: e.target.value })}
                        className="bg-transparent border-none text-[11px] font-black text-slate-700 w-full focus:ring-0 p-0" />
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={item.codigo}
                        onChange={e => immutableUpdate(dia.id, idx, { codigo: e.target.value })}
                        className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[11px] font-black py-1 outline-none" />
                    </td>
                    <td className="px-8 py-2">
                      <div className="flex gap-2">
                        {[0, 1, 2].map(eIdx => (
                          <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ''}
                            onChange={e => {
                              const newEscalados = [...item.escalados];
                              newEscalados[eIdx] = e.target.value;
                              immutableUpdate(dia.id, idx, { escalados: newEscalados });
                              onDuplicateCheck(e.target.value, dia.id, item.congregacao);
                            }}
                            className="flex-1 min-w-[100px] bg-slate-50 border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm" />
                        ))}
                      </div>
                    </td>
                    <td className="px-2 no-print">
                      <button onClick={() => removeRow(dia.id, idx)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addRow(dia.id)}
              className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase text-slate-400 tracking-wider transition-all">
              + Adicionar Linha
            </button>
          </div>
        ))}
      </div>
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
    if (updated[diaId]) updated[diaId] = updated[diaId].filter((_, i) => i !== idx);
    onUpdate(updated);
  }

  function addRow(diaId: string) {
    const updated = { ...escalaOficial };
    if (!updated[diaId]) updated[diaId] = [];
    updated[diaId] = [...updated[diaId], { congregacao: '', codigo: '04', escalados: ['', '', ''] }];
    onUpdate(updated);
  }
}
