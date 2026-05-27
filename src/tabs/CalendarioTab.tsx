import { useState, useRef, useCallback } from 'react';
import { format, addDays, addMonths, subMonths, startOfWeek, startOfMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Evento } from '../types';
import { EventoModal } from '../components/EventoModal';

const EVENT_COLORS = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-green-600',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
];

interface Props {
  eventos: Evento[];
  onUpdate: (items: Evento[]) => void;
}

function getEventsForDay(events: Evento[], day: Date) {
  return events.filter(ev => {
    try {
      let d = 0, m = 0, y = 0;
      if (ev.data.includes('/')) { [d, m, y] = ev.data.split('/').map(Number); }
      else { [y, m, d] = ev.data.split('-').map(Number); }
      return d === day.getDate() && m === (day.getMonth() + 1) && y === day.getFullYear();
    } catch { return false; }
  });
}

function getEventColor(descricao: string) {
  let hash = 0;
  for (let i = 0; i < descricao.length; i++) {
    hash = descricao.charCodeAt(i) + ((hash << 5) - hash);
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

export function CalendarioTab({ eventos, onUpdate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [novoEvento, setNovoEvento] = useState({ data: '', descricao: '', cc: '', congregacao: '', programacaoEntregue: false, conjuntosConvidados: [{ nome: '', congregacao: '' }, { nome: '', congregacao: '' }], cantoresConvidados: '', imagemAnexo: undefined as string | undefined });
  const touchStartX = useRef(0);

  const days = Array.from({ length: 42 }).map((_, i) => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    return addDays(start, i);
  });

  const selectedEvents = selectedDay ? getEventsForDay(eventos, selectedDay) : [];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrentDate(prev => subMonths(prev, 1));
      else setCurrentDate(prev => addMonths(prev, 1));
    }
  }, []);

  const addEvent = () => {
    if (!novoEvento.data || !novoEvento.descricao) return;
    onUpdate([{ ...novoEvento, id: Math.random().toString(36).substr(2, 9) }, ...eventos]);
    setNovoEvento({ data: '', descricao: '', cc: '', congregacao: '', programacaoEntregue: false, conjuntosConvidados: [{ nome: '', congregacao: '' }, { nome: '', congregacao: '' }], cantoresConvidados: '', imagemAnexo: undefined });
    setShowNewEvent(false);
  };

  const selectToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
    setShowNewEvent(false);
  };

  return (
    <div className="space-y-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Header minimalista */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-90">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <h2 className="text-lg md:text-2xl font-black text-slate-800 select-none">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm active:scale-90">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={selectToday}
            className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all uppercase tracking-wider">
            Hoje
          </button>
          <button onClick={() => { setShowNewEvent(true); setSelectedDay(null); }}
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm active:scale-90">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(d => (
            <div key={d} className="text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider py-2 md:py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isSameMonth = day.getMonth() === currentDate.getMonth();
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isTodayDate = isToday(day);
            const dayEvents = getEventsForDay(eventos, day);

            return (
              <button
                key={i}
                onClick={() => {
                  if (!isSameMonth) {
                    if (i < 7) setCurrentDate(prev => subMonths(prev, 1));
                    else setCurrentDate(prev => addMonths(prev, 1));
                  }
                  setSelectedDay(isSelected ? null : day);
                  setShowNewEvent(false);
                }}
                className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 px-0.5 transition-all
                  ${isSameMonth ? 'bg-white' : 'bg-slate-50/50'}
                  ${isSelected ? 'bg-blue-50' : ''}
                  hover:bg-blue-50/50 active:bg-blue-100 min-h-[48px] md:min-h-[72px] border-b border-r border-slate-100 last:border-r-0`}
              >
                <span className={`text-[11px] md:text-sm font-bold leading-none mb-0.5 md:mb-1 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full
                  ${isTodayDate ? 'bg-blue-600 text-white' : ''}
                  ${!isSameMonth ? 'text-slate-300' : isSelected && !isTodayDate ? 'text-blue-700' : 'text-slate-700'}`}>
                  {day.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 max-w-full px-0.5">
                    {dayEvents.slice(0, 3).map((ev, ei) => (
                      <span key={ei} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${getEventColor(ev.descricao)}`} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] md:text-[8px] font-bold text-slate-400">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel de eventos do dia selecionado */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800">
                {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  const dataStr = format(selectedDay, "dd/MM/yyyy");
                  setNovoEvento({ ...novoEvento, data: dataStr });
                  setShowNewEvent(true);
                }}
                  className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all uppercase tracking-wider">
                  + Novo
                </button>
                <button onClick={() => setSelectedDay(null)}
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all">
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
            {selectedEvents.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs font-bold text-slate-400">Nenhum evento neste dia</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} onClick={() => setEditingEvento(ev)} className="px-4 py-3 hover:bg-slate-50 transition-all group cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${getEventColor(ev.descricao)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 truncate">{ev.descricao}</p>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ev.programacaoEntregue
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-50 text-red-500'
                          }`}>
                            Prog.: {ev.programacaoEntregue ? 'Entregue' : 'Pendente'}
                          </span>
                        </div>
                        {ev.congregacao && (
                          <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {ev.congregacao}
                          </p>
                        )}
                        {(ev.conjuntosConvidados || []).filter((c: any) => c?.nome).length > 0 && (
                          <p className="text-[9px] font-bold text-slate-500 mt-1">
                            Conjuntos: {(ev.conjuntosConvidados || []).filter((c: any) => c?.nome).map((c: any) => c.nome).join(', ')}
                          </p>
                        )}
                        {ev.cantoresConvidados && (
                          <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                            Cantores: {ev.cantoresConvidados}
                          </p>
                        )}
                        {ev.imagemAnexo && (
                          <img src={ev.imagemAnexo} alt="Anexo" className="mt-2 h-16 w-auto rounded-lg border border-slate-200 object-cover" />
                        )}
                      </div>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Excluir este evento?")) onUpdate(eventos.filter(item => item.id !== ev.id));
                      }}
                        className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all p-1 shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário de novo evento (slide up) */}
      <AnimatePresence>
        {showNewEvent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800">Novo Evento</h3>
              <button onClick={() => setShowNewEvent(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <X size={14} className="text-slate-400" />
              </button>
            </div>
            <input type="date" value={novoEvento.data} onChange={e => setNovoEvento({ ...novoEvento, data: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all" />
            <input type="text" placeholder="Descrição do evento..." value={novoEvento.descricao} onChange={e => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all" />
            <input type="text" placeholder="Local / Congregação (opcional)" value={novoEvento.congregacao} onChange={e => setNovoEvento({ ...novoEvento, congregacao: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all" />
            <div className="flex gap-2 pt-1">
              <button onClick={addEvent}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm">
                Salvar
              </button>
              <button onClick={() => setShowNewEvent(false)}
                className="px-6 py-3 rounded-xl font-bold text-[10px] text-slate-500 hover:bg-slate-100 transition-all uppercase">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legenda de contagem */}
      <div className="text-center">
        <p className="text-[10px] font-bold text-slate-400">
          {eventos.length} evento{eventos.length !== 1 ? 's' : ''} cadastrado{eventos.length !== 1 ? 's' : ''}
        </p>
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
