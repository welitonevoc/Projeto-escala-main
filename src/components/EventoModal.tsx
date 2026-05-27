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

  const conjuntos = evento.conjuntosConvidados || [{ nome: '', congregacao: '' }, { nome: '', congregacao: '' }];

  const updateConjunto = (idx: number, field: 'nome' | 'congregacao', value: string) => {
    const novos = [...conjuntos];
    novos[idx] = { ...novos[idx], [field]: value };
    onSave({ ...evento, conjuntosConvidados: novos });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4"
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="bg-blue-600 px-5 py-4 md:px-8 md:py-6 text-white flex items-center justify-between shrink-0">
            <div>
              <p className="text-[8px] font-black uppercase text-blue-200 tracking-widest mb-1">Festividade</p>
              <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-tight leading-none">Editar Evento</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all active:scale-90">
              &times;
            </button>
          </div>

          <div className="p-5 md:p-8 space-y-5 overflow-y-auto">
            {/* Data */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Data</label>
              <input
                type="date"
                value={evento.data.includes('/') ? evento.data.split('/').reverse().join('-') : evento.data}
                onChange={e => {
                  const parts = e.target.value.split('-');
                  onSave({ ...evento, data: `${parts[2]}/${parts[1]}/${parts[0]}` });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Descrição do Evento</label>
              <textarea
                rows={2}
                value={evento.descricao}
                onChange={e => onSave({ ...evento, descricao: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Local */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Local / Congregação</label>
              <input
                type="text"
                value={evento.congregacao}
                onChange={e => onSave({ ...evento, congregacao: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
                placeholder="(opcional)"
              />
            </div>

            {/* Programação entregue */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Programação já foi entregue?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => onSave({ ...evento, programacaoEntregue: true })}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] ${
                    evento.programacaoEntregue
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => onSave({ ...evento, programacaoEntregue: false })}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] ${
                    !evento.programacaoEntregue
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>

            {/* Conjuntos Convidados */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Conjuntos Convidados</label>
              {[0, 1].map((idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">{idx === 0 ? '1º Conjunto' : '2º Conjunto'}</p>
                  <input
                    type="text"
                    value={conjuntos[idx]?.nome || ''}
                    onChange={e => updateConjunto(idx, 'nome', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Nome do conjunto"
                  />
                  <input
                    type="text"
                    value={conjuntos[idx]?.congregacao || ''}
                    onChange={e => updateConjunto(idx, 'congregacao', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Congregação do conjunto"
                  />
                </div>
              ))}
            </div>

            {/* Cantores Convidados */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cantores Convidados</label>
              <textarea
                rows={2}
                value={evento.cantoresConvidados || ''}
                onChange={e => onSave({ ...evento, cantoresConvidados: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all resize-none"
                placeholder="Nomes dos cantores convidados"
              />
            </div>

            {/* Imagem Anexo */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Imagem Anexo</label>
              {evento.imagemAnexo ? (
                <div className="relative">
                  <img src={evento.imagemAnexo} alt="Anexo" className="w-full max-h-48 object-contain rounded-xl border border-slate-200 bg-slate-50" />
                  <button
                    onClick={() => onSave({ ...evento, imagemAnexo: undefined })}
                    className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-600 transition-all active:scale-90 text-sm font-bold shadow-md"
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer">
                  <svg className="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-[10px] font-bold text-slate-400">Clique para adicionar imagem</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const base64 = ev.target?.result as string;
                        onSave({ ...evento, imagemAnexo: base64 });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="px-5 pb-5 md:px-8 md:pb-8 flex gap-3 shrink-0">
            <button
              onClick={() => { onSave(evento); onClose(); }}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm"
            >
              Salvar
            </button>
            <button
              onClick={() => { if (confirm("Excluir este evento?")) { onDelete(evento.id); onClose(); } }}
              className="bg-red-50 text-red-500 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
            >
              Excluir
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
