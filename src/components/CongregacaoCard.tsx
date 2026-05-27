import { motion } from 'motion/react';
import { Users, MapPin, Church } from 'lucide-react';
import type { Congregacao, Obreiro } from '../types';
import { TIPOS_DEPARTAMENTO } from '../constants';

interface CongregacaoCardProps {
  cong: Congregacao;
  obreiros: Obreiro[];
  onEdit: () => void;
}

export function CongregacaoCard({ cong, obreiros, onEdit }: CongregacaoCardProps) {
  const age = cong.dataInauguracao ? new Date().getFullYear() - new Date(cong.dataInauguracao).getFullYear() : null;
  const obreirosDaCong = obreiros.filter(o => o.congregacao === cong.nome);
  const ativos = TIPOS_DEPARTAMENTO.filter(t => cong.departamentos?.some(d => d.tipo === t.id));

  return (
    <div className="bg-white rounded-[40px] border border-[#c5d8ef] shadow-xl overflow-hidden hover:-translate-y-2 transition-all duration-500 group border-b-8 border-b-blue-600">
      <div className="bg-[#0e3d6e] p-8 text-white relative h-44 flex flex-col justify-end">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">{cong.nome}</h3>
        <p className="text-blue-300 text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest">
          <MapPin size={12} /> {cong.endereco?.slice(0, 35)}...
        </p>
        {age !== null && (
          <div className="absolute top-6 right-6 bg-amber-400 text-black px-4 py-1.5 rounded-full text-[9px] font-black shadow-lg flex items-center gap-1.5">
            <span>📅</span> {age} ANOS
          </div>
        )}
      </div>

      <div className="p-8 space-y-5">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
          <p className="text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-[2px] mb-2 leading-none">Obreiro Responsável</p>
          <p className="text-sm font-black text-blue-900 flex items-center gap-3">
            <Users size={16} className="text-blue-500" /> {cong.responsavelNome || '—'}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-[2px] leading-none flex items-center gap-2">
            <span>🏛️</span> Departamentos Ativos ({ativos.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {ativos.length === 0 && (
              <span className="text-slate-300 text-[10px] font-bold italic">Nenhum departamento configurado</span>
            )}
            {ativos.map((t, tIdx) => (
              <span key={tIdx} className={`${t.cor} text-white px-3 py-1.5 rounded-full text-[9px] font-black shadow-sm flex items-center gap-1`}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-blue-50 rounded-2xl px-5 py-3">
          <div className="flex items-center gap-2">
            <Church size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-blue-700">{obreirosDaCong.length} obreiros</span>
          </div>
          {cong.dataInauguracao && (
            <span className="text-[9px] font-bold text-slate-400">{cong.dataInauguracao}</span>
          )}
        </div>

        <button onClick={onEdit} className="w-full py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-md">
          Gerenciar Templo
        </button>
      </div>
    </div>
  );
}
