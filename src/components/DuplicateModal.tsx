import { motion, AnimatePresence } from 'motion/react';
import type { DuplicateData } from '../types';

interface DuplicateModalProps {
  data: DuplicateData | null;
  onClose: () => void;
}

export function DuplicateModal({ data, onClose }: DuplicateModalProps) {
  return (
    <AnimatePresence>
      {data?.isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[16px] p-7 max-w-[420px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-t-5 border-[#e05c2a]">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-[#b83a10] text-lg font-black mb-3">Obreiro já escalado neste dia!</h3>
              <p className="text-slate-800 font-bold mb-2">{data.worker}</p>
              <p className="text-slate-500 text-sm bg-[#fff3f0] px-4 py-3 rounded-lg border-l-4 border-[#e05c2a] mb-5">
                Já está escalado em <strong>{data.congregacao}</strong> neste mesmo dia.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={onClose} className="bg-[#0d4a8a] text-white px-6 py-3 rounded-full font-black text-sm hover:bg-blue-700 transition-all">✅ Manter assim mesmo</button>
                <button onClick={onClose} className="bg-[#e05c2a] text-white px-6 py-3 rounded-full font-black text-sm hover:bg-orange-600 transition-all">❌ Remover desta vaga</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
