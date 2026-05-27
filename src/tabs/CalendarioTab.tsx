import { useState } from 'react';
import { format, addDays, startOfWeek, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, MapPin, Trash2 } from 'lucide-react';
import type { Evento } from '../types';
import { EventoModal } from '../components/EventoModal';

interface Props {
  eventos: Evento[];
  onUpdate: (items: Evento[]) => void;
}

export function CalendarioTab({ eventos, onUpdate }: Props) {
  const [dataVisual, setDataVisual] = useState(new Date());
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [novoEvento, setNovoEvento] = useState({ data: '', descricao: '', cc: '', congregacao: '' });

  const days = Array.from({ length: 42 }).map((_, i) => {
    const start = startOfWeek(startOfMonth(dataVisual), { weekStartsOn: 1 });
    return addDays(start, i);
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-[#0e3d6e] p-8 md:p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 no-print">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <button onClick={() => setDataVisual(addDays(dataVisual, -30))} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-black text-xl">&lt;</button>
            <h2 className="text-4xl font-black italic uppercase tracking-widest">{format(dataVisual, "MMMM yyyy", { locale: ptBR })}</h2>
            <button onClick={() => setDataVisual(addDays(dataVisual, 30))} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all font-black text-xl">&gt;</button>
          </div>
          <p className="text-blue-300 font-bold uppercase tracking-[3px] text-xs">Gestão Visual de Festividades e Cultos Especiais</p>
        </div>
        <button onClick={() => window.print()} className="bg-amber-400 text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-[3px] hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center gap-4">
          <Printer size={20} /> Imprimir Escala Mensal
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Calendar Grid */}
        <div className="xl:col-span-3 bg-white p-8 rounded-[40px] border border-[#c5d8ef] shadow-2xl">
          <div className="grid grid-cols-7 border-b-2 border-slate-50 pb-6 mb-6">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[4px]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-[#fff9e8] rounded-[32px] overflow-hidden border border-slate-100">
            {days.map((day, i) => {
              const isSameMonth = day.getMonth() === dataVisual.getMonth();
              const dayEvs = eventos.filter(ev => {
                try {
                  let d = 0, m = 0, y = 0;
                  if (ev.data.includes('/')) { [d, m, y] = ev.data.split('/').map(Number); }
                  else { [y, m, d] = ev.data.split('-').map(Number); }
                  return d === day.getDate() && m === (day.getMonth() + 1) && y === day.getFullYear();
                } catch { return false; }
              });
              return (
                <div key={i} className={`min-h-[140px] p-4 flex flex-col gap-2 transition-all ${isSameMonth ? 'bg-white hover:bg-blue-50/20' : 'bg-slate-50/50 opacity-20'}`}>
                  <span className={`text-xs font-black ${isSameMonth ? 'text-slate-800' : 'text-slate-300'}`}>{day.getDate()}</span>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                    {dayEvs.map((ev, eIdx) => (
                      <button key={eIdx} onClick={() => setEditingEvento(ev)}
                        className="w-full text-left text-[8px] font-black bg-[#0d4a8a] text-white p-1.5 rounded-lg shadow-sm border-l-4 border-amber-400 truncate hover:bg-blue-700 transition-colors">
                        {ev.descricao}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="bg-white p-8 rounded-[40px] border border-[#c5d8ef] shadow-2xl no-print space-y-8">
          <h3 className="text-sm font-black text-blue-900 uppercase italic border-b border-slate-100 pb-4 tracking-widest">Festividades</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {eventos.filter(ev => {
              try {
                let d = 0, m = 0, y = 0;
                if (ev.data.includes('/')) { [d, m, y] = ev.data.split('/').map(Number); }
                else { [y, m, d] = ev.data.split('-').map(Number); }
                return m === (dataVisual.getMonth() + 1) && y === dataVisual.getFullYear();
              } catch { return false; }
            }).sort((a, b) => a.data.localeCompare(b.data)).map((ev, idx) => (
              <div key={idx} onClick={() => setEditingEvento(ev)}
                className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 relative group overflow-hidden cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{ev.data}</span>
                  <button onClick={e => { e.stopPropagation(); onUpdate(eventos.filter(item => item.id !== ev.id)); }} className="text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
                </div>
                <p className="text-xs font-black text-slate-800 leading-tight mb-2">{ev.descricao}</p>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MapPin size={10} /> {ev.congregacao || "Geral"}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-100 space-y-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Novo Evento</p>
            <input type="text" placeholder="DD/MM/AAAA" value={novoEvento.data} onChange={e => setNovoEvento({ ...novoEvento, data: e.target.value })}
              className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
            <input type="text" placeholder="Descrição da festa..." value={novoEvento.descricao} onChange={e => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
              className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-5 py-3 text-xs font-bold outline-none" />
            <button onClick={() => {
              if (!novoEvento.data || !novoEvento.descricao) return;
              onUpdate([{ ...novoEvento, id: Math.random().toString(36).substr(2, 9) }, ...eventos]);
              setNovoEvento({ data: '', descricao: '', cc: '', congregacao: '' });
            }} className="w-full bg-[#0d4a8a] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Adicionar</button>
          </div>
        </div>
      </div>

      <EventoModal
        evento={editingEvento}
        onSave={(ev) => onUpdate(eventos.map(e => e.id === ev.id ? ev : e))}
        onDelete={(id) => onUpdate(eventos.filter(e => e.id !== id))}
        onClose={() => setEditingEvento(null)}
      />
    </div>
  );
}
