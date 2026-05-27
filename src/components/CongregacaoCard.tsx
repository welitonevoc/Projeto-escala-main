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
    <div className="bg-white rounded-[24px] md:rounded-[40px] border border-[#c5d8ef] shadow-sm md:shadow-xl overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 group border-b-4 md:border-b-8 border-b-blue-600">
      <div className="bg-[#0e3d6e] p-5 md:p-8 text-white relative h-28 md:h-44 flex flex-col justify-end">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/5 rounded-full -mr-10 md:-mr-16 -mt-10 md:-mt-16 group-hover:scale-150 transition-transform duration-1000" />
        <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tight leading-none mb-1">{cong.nome}</h3>
        <p className="text-blue-300 text-[8px] md:text-[10px] font-bold flex items-center gap-1 md:gap-2 uppercase tracking-wider">
          <MapPin size={10} /> {cong.endereco?.slice(0, 30)}...
        </p>
        {age !== null && (
          <div className="absolute top-3 md:top-6 right-3 md:right-6 bg-amber-400 text-black px-2 md:px-4 py-0.5 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black shadow-lg flex items-center gap-1">
            <span>📅</span> {age} ANOS
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 space-y-3 md:space-y-5">
        <div className="bg-slate-50 p-3 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100">
          <p className="text-[10px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-[1px] md:tracking-[2px] mb-1 md:mb-2 leading-none">Responsável</p>
          <p className="text-xs md:text-sm font-black text-blue-900 flex items-center gap-2 md:gap-3">
            <Users size={14} className="text-blue-500" /> {cong.responsavelNome || '—'}
          </p>
        </div>

        <div className="space-y-2 md:space-y-3">
          <p className="text-[10px] md:text-[0.75rem] font-bold text-[#0d3d7a] uppercase tracking-[1px] md:tracking-[2px] leading-none flex items-center gap-1 md:gap-2">
            <span>🏛️</span> Departamentos ({ativos.length})
          </p>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {ativos.length === 0 && (
              <span className="text-slate-300 text-[8px] md:text-[10px] font-bold italic">Nenhum</span>
            )}
            {ativos.map((t, tIdx) => (
              <span key={tIdx} className={`${t.cor} text-white px-2 md:px-3 py-0.5 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black shadow-sm flex items-center gap-0.5 md:gap-1`}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between bg-blue-50 rounded-xl md:rounded-2xl px-3 md:px-5 py-2 md:py-3">
          <div className="flex items-center gap-1 md:gap-2">
            <Church size={12} className="text-blue-500" />
            <span className="text-[8px] md:text-[10px] font-black text-blue-700">{obreirosDaCong.length} obreiros</span>
          </div>
          {cong.dataInauguracao && (
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400">{cong.dataInauguracao}</span>
          )}
        </div>

        <button onClick={onEdit} className="w-full py-3 md:py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl md:rounded-3xl font-black text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm">
          Gerenciar
        </button>
      </div>
    </div>
  );
}
