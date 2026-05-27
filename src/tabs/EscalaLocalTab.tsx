import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DIAS_SEMANA_LOCAL, DIAS_SEMANA_PP, DIAS_SEMANA_PORTARIA, DIAS_OFFSET } from '../constants';
import type { EscalaLocalItem } from '../types';

interface Props {
  escalaLocal: EscalaLocalItem[];
  dataInicio: string;
  onUpdate: (items: EscalaLocalItem[]) => void;
  onDuplicateCheck: (valor: string, diaId: string, local: string) => void;
}

export function EscalaLocalTab({ escalaLocal, dataInicio, onUpdate, onDuplicateCheck }: Props) {
  const [secAtiva, setSecAtiva] = useState(0);
  const [diaAtivo, setDiaAtivo] = useState(0);
  const touchStartX = useRef(0);

  const secoes = [
    { titulo: 'C.O. Local', sigla: 'CO', cor: 'bg-[#0d4a8a]', corBorda: 'border-[#1a70b8]', bgTabela: 'bg-[#e6f0fa]', dias: DIAS_SEMANA_LOCAL, categoria: 'Local', codigoPadrao: '34', escaladosPadrao: ['Pr. Severino Guilhermino', '', ''] },
    { titulo: 'Ponto de Pregação', sigla: 'PP', cor: 'bg-[#e05c2a]', corBorda: 'border-[#b83a10]', bgTabela: 'bg-[#fff3f0]', dias: DIAS_SEMANA_PP, categoria: 'PP', codigoPadrao: '61', escaladosPadrao: ['', '', '', ''] },
    { titulo: 'Portaria', sigla: 'PT', cor: 'bg-[#1a5fa0]', corBorda: 'border-[#0d4a8a]', bgTabela: 'bg-[#e6f0fa]', dias: DIAS_SEMANA_PORTARIA, categoria: 'Portaria', codigoPadrao: '', escaladosPadrao: ['', '', '', ''] },
  ];

  const secao = secoes[secAtiva];
  const dia = secao.dias[diaAtivo];
  const items = escalaLocal.filter(l => l.categoria === secao.categoria && l.data === (dia?.id || ''));

  const getDiaLabelLocal = (d: { label: string; parent?: string }) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[d.parent ?? ''] || 0);
    return `${format(date, "dd/MM/yyyy")} - ${d.label}`;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && diaAtivo > 0) setDiaAtivo(prev => prev - 1);
      else if (diff < 0 && diaAtivo < secao.dias.length - 1) setDiaAtivo(prev => prev + 1);
    }
  }, [diaAtivo, secao.dias.length]);

  return (
    <div className="space-y-6 md:space-y-12" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Mobile: seletor de seção + dias */}
      <div className="md:hidden">
        {/* Section pills */}
        <div className="flex gap-2 mb-4">
          {secoes.map((sec, idx) => (
            <button key={sec.categoria}
              onClick={() => { setSecAtiva(idx); setDiaAtivo(0); }}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                idx === secAtiva
                  ? `${sec.cor} text-white shadow-md`
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {sec.sigla}
            </button>
          ))}
        </div>

        {/* Day pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
          {secao.dias.map((d, idx) => (
            <button key={d.id}
              onClick={() => setDiaAtivo(idx)}
              className={`shrink-0 px-3 py-2 rounded-xl text-[8px] font-bold uppercase tracking-wider transition-all ${
                idx === diaAtivo
                  ? `${secao.cor} text-white shadow-md`
                  : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              {d.label.split(' - ')[0].slice(0, 3)} / {d.label.includes('Manhã') ? 'Manhã' : d.label.includes('Tarde') ? 'Tarde' : 'Noite'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={secao.categoria + '-' + dia?.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-white rounded-2xl border border-[#c5daf0] shadow-sm overflow-hidden">
              <div className={`${secao.cor} px-4 py-3 border-l-8 ${secao.corBorda}`}>
                <h2 className="text-white text-sm font-semibold">{dia?.label}</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={item.local} onChange={e => updateItem(item, 'local', e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs font-semibold text-slate-700 outline-none p-0" placeholder="Local" />
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Cód</span>
                        <input type="text" value={item.codigo} onChange={e => updateItem(item, 'codigo', e.target.value)}
                          className="w-9 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[10px] font-black py-1 outline-none" />
                      </div>
                      <button onClick={() => removeItem(item)} className="text-red-300 hover:text-red-500 p-1 shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map(eIdx => (
                        <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ''} placeholder="..."
                          onChange={e => {
                            const newE = [...item.escalados];
                            newE[eIdx] = e.target.value;
                            updateItem(item, 'escalados', newE);
                            onDuplicateCheck(e.target.value, dia.parent || dia.id, item.local);
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => addItem(secao.categoria, dia.id, secao.codigoPadrao, secao.escaladosPadrao)}
                className="w-full py-3 bg-[#1a70b820] hover:bg-[#1a70b840] text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1">
                <Plus size={12} /> Adicionar
              </button>
            </div>

            {/* Swipe dots */}
            <div className="flex justify-center gap-2 mt-3">
              {secao.dias.map((_, idx) => (
                <button key={idx} onClick={() => setDiaAtivo(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === diaAtivo ? `${secao.cor.replace('bg-', 'bg-')} w-4` : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: tabela completa */}
      <div className="hidden md:block space-y-12">
        {secoes.map(sec => (
          <div key={sec.categoria} className="space-y-8">
            <div className={`${sec.categoria === 'PP' ? 'bg-orange-100 border-orange-500' : 'bg-blue-50 border-blue-500'} border-2 border-dashed rounded-[20px] p-6`}>
              <h2 className={`${sec.categoria === 'PP' ? 'text-[#b83a10]' : 'text-[#0d4a8a]'} text-xl font-black uppercase tracking-wider flex items-center gap-3`}>
                <span className={`${sec.cor} text-white px-3 py-1 rounded-full text-sm`}>{sec.categoria === 'PP' ? 'PP' : sec.categoria === 'Portaria' ? 'P' : 'CO'}</span> {sec.titulo}
              </h2>
            </div>
            {sec.dias.map(d => {
              const dayItems = escalaLocal.filter(l => l.categoria === sec.categoria && l.data === d.id);
              return (
                <div key={d.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden">
                  <div className={`${sec.cor} px-5 py-3 border-l-8 ${sec.corBorda}`}>
                    <h2 className="text-white text-lg font-semibold">{getDiaLabelLocal(d)}</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${sec.bgTabela} border-b-2 border-[#a8c8e8]`}>
                        <th className="px-8 py-3 text-[0.8rem] font-bold uppercase tracking-wider">Local</th>
                        <th className="px-2 py-3 text-[0.8rem] font-bold uppercase tracking-wider text-center">Cód</th>
                        <th className="px-8 py-3 text-[0.8rem] font-bold uppercase tracking-wider text-center italic">Escalados</th>
                        <th className="w-10 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c5d8ef]">
                      {dayItems.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-[#e6f0fa]/30 transition-all">
                          <td className="px-8 py-2">
                            <input type="text" value={item.local} onChange={e => updateItem(item, 'local', e.target.value)}
                              className="text-[0.85rem] font-semibold text-[#0a2a4a] bg-[#f5f9ff] w-full px-2 py-1 outline-none border-none" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="text" value={item.codigo} onChange={e => updateItem(item, 'codigo', e.target.value)}
                              className="w-10 bg-[#fff9e8] text-[#1a5fa0] rounded text-center text-[0.85rem] font-black py-1 outline-none" />
                          </td>
                          <td className="px-8 py-2">
                            <div className="flex gap-2">
                              {[0, 1, 2, 3].map(eIdx => (
                                <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ''} placeholder="..."
                                  onChange={e => {
                                    const newE = [...item.escalados];
                                    newE[eIdx] = e.target.value;
                                    updateItem(item, 'escalados', newE);
                                    onDuplicateCheck(e.target.value, d.parent || d.id, item.local);
                                  }}
                                  className="flex-1 min-w-[100px] bg-white border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[0.85rem] font-bold text-slate-800 outline-none transition-all shadow-sm" />
                              ))}
                            </div>
                          </td>
                          <td className="px-2 no-print">
                            <button onClick={() => removeItem(item)} className="text-red-300 hover:text-red-500 transition-colors p-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => addItem(sec.categoria, d.id, sec.codigoPadrao, sec.escaladosPadrao)}
                    className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase tracking-wider transition-all">
                    + Adicionar Linha {sec.categoria}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  function updateItem(item: EscalaLocalItem, field: string, value: any) {
    onUpdate(escalaLocal.map(i => i === item ? { ...i, [field]: value } : i));
  }

  function removeItem(item: EscalaLocalItem) {
    onUpdate(escalaLocal.filter(i => i !== item));
  }

  function addItem(categoria: string, data: string, codigo: string, escalados: string[]) {
    onUpdate([...escalaLocal, { categoria, data, local: '', codigo, escalados: [...escalados] }]);
  }
}
