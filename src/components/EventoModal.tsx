import { motion, AnimatePresence } from 'motion/react';
import type { Evento } from '../types';

interface EventoModalProps {
  evento: Evento | null;
  onSave: (e: Evento) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function EventoModal({ evento, onSave, onDelete, onClose }: EventoModalProps) {
  if (!evento) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#071f37]/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl">
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[50px] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20">
          <div className="bg-[#0e4b8a] py-10 px-12 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-blue-200 tracking-[5px] mb-2">Festividade</p>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Editar Evento</h2>
            </div>
            <button onClick={onClose} className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-2xl shadow-lg">&times;</button>
          </div>
          <div className="p-12 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Data (DD/MM/AAAA)</label>
              <input type="text" value={evento.data} onChange={e => onSave({ ...evento, data: e.target.value })}
                className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-6 py-4 font-black text-blue-900 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">Descrição do Evento</label>
              <textarea rows={3} value={evento.descricao} onChange={e => onSave({ ...evento, descricao: e.target.value })}
                className="w-full bg-slate-50 border border-[#c5d8ef] rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" />
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => { onSave(evento); onClose(); }} className="flex-1 bg-[#0d4a8a] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Salvar</button>
              <button onClick={() => { if(confirm("Excluir?")) { onDelete(evento.id); onClose(); } }}
                className="bg-red-50 text-red-500 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Excluir</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
