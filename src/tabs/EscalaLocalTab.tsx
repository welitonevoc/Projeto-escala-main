import { Calendar } from 'lucide-react';
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
  const getDiaLabelLocal = (dia: any) => {
    const date = addDays(parseISO(dataInicio), DIAS_OFFSET[dia.parent] || 0);
    return `${format(date, "dd/MM/yyyy")} - ${dia.label}`;
  };

  const secoes = [
    { titulo: 'C.O. Local', cor: 'bg-[#0d4a8a]', corBorda: 'border-[#1a70b8]', bgTabela: 'bg-[#e6f0fa]', dias: DIAS_SEMANA_LOCAL, categoria: 'Local', codigoPadrao: '34', escaladosPadrao: ['Pr. Severino Guilhermino', '', ''] },
    { titulo: 'Ponto de Pregação (PP) - Semanal', cor: 'bg-[#e05c2a]', corBorda: 'border-[#b83a10]', bgTabela: 'bg-[#fff3f0]', dias: DIAS_SEMANA_PP, categoria: 'PP', codigoPadrao: '61', escaladosPadrao: ['', '', '', ''] },
    { titulo: 'Portaria - Semanal', cor: 'bg-[#1a5fa0]', corBorda: 'border-[#0d4a8a]', bgTabela: 'bg-[#e6f0fa]', dias: DIAS_SEMANA_PORTARIA, categoria: 'Portaria', codigoPadrao: '', escaladosPadrao: ['', '', '', ''] },
  ];

  return (
    <div className="space-y-12">
      {secoes.map(sec => (
        <div key={sec.categoria} className="space-y-8">
          <div className={`${sec.categoria === 'PP' ? 'bg-orange-100 border-orange-500' : sec.categoria === 'Portaria' ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-500'} border-2 border-dashed rounded-[20px] p-6`}>
            <h2 className={`${sec.categoria === 'PP' ? 'text-[#b83a10]' : 'text-[#0d4a8a]'} text-xl font-black uppercase tracking-wider flex items-center gap-3`}>
              <span className={`${sec.cor} text-white px-3 py-1 rounded-full text-sm`}>{sec.categoria === 'PP' ? 'PP' : sec.categoria === 'Portaria' ? 'P' : 'CO'}</span> {sec.titulo}
            </h2>
          </div>
          {sec.dias.map(dia => {
            const items = escalaLocal.filter(l => l.categoria === sec.categoria && l.data === dia.id);
            return (
              <div key={dia.id} className="bg-white rounded-[20px] border border-[#c5daf0] shadow-xl overflow-hidden">
                <div className={`${sec.cor} px-5 py-3 flex justify-between items-center border-l-8 ${sec.corBorda}`}>
                  <h2 className="text-white text-[1.1rem] font-semibold">{getDiaLabelLocal(dia)}</h2>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${sec.bgTabela} border-b-2`}>
                      <th className="px-8 py-3 text-[0.8rem] font-bold uppercase tracking-widest">Local</th>
                      <th className="px-2 py-3 text-[0.8rem] font-bold uppercase tracking-widest text-center">Cód</th>
                      <th className="px-8 py-3 text-[0.8rem] font-bold uppercase tracking-[8px] text-center italic">Escalados</th>
                      <th className="w-10 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c5d8ef]">
                    {items.map((item, idx) => (
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
                          <div className="flex gap-2 flex-wrap">
                            {[0, 1, 2, 3].map(eIdx => (
                              <input key={eIdx} list="lista-obreiros" value={item.escalados[eIdx] || ''} placeholder="..."
                                onChange={e => {
                                  const newE = [...item.escalados];
                                  newE[eIdx] = e.target.value;
                                  updateItem(item, 'escalados', newE);
                                  onDuplicateCheck(e.target.value, dia.parent || dia.id, item.local);
                                }}
                                className="flex-1 min-w-[120px] bg-white border border-[#c5d8ef] rounded-lg px-3 py-1.5 text-[0.85rem] font-bold text-slate-800 outline-none transition-all shadow-sm" />
                            ))}
                          </div>
                        </td>
                        <td className="px-2 no-print">
                          <button onClick={() => removeItem(item)} className="text-red-300 hover:text-red-500 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => addItem(sec.categoria, dia.id, sec.codigoPadrao, sec.escaladosPadrao)}
                  className="no-print w-full py-4 bg-[#1a70b820] hover:bg-[#1a70b840] text-[10px] font-black uppercase tracking-widest transition-all">
                  + Adicionar Linha {sec.categoria}
                </button>
              </div>
            );
          })}
        </div>
      ))}
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
