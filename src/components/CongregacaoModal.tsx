import { motion } from 'motion/react';
import { Church, Users } from 'lucide-react';
import type { Congregacao, Obreiro } from '../types';
import { TIPOS_DEPARTAMENTO } from '../constants';

interface CongregacaoModalProps {
  cong: Congregacao;
  index: number;
  obreiros: Obreiro[];
  onUpdate: (index: number, field: string, value: any) => void;
  onUpdateDepartamento: (congIndex: number, tipo: string, field: string, value: string) => void;
  onToggleDepartamento: (congIndex: number, tipo: string) => void;
  onDelete: (index: number) => void;
  onClose: () => void;
}

export function CongregacaoModal({
  cong, index, obreiros, onUpdate, onUpdateDepartamento, onToggleDepartamento, onDelete, onClose
}: CongregacaoModalProps) {
  const obreirosDaCong = obreiros.filter(o => o.congregacao === cong.nome);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#071f37]/95 z-[10000] flex items-center justify-center p-4 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[60px] w-full max-w-6xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        <div className="bg-[#0e3d6e] py-10 px-14 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10">
            <p className="text-[11px] font-black uppercase text-blue-300 tracking-[6px] mb-3 leading-none italic">Gestão Administrativa</p>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{cong.nome}</h2>
          </div>
          <button onClick={onClose} className="relative z-10 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-black text-3xl shadow-xl hover:rotate-90 duration-500">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* COL 1: DADOS GERAIS */}
            <div className="space-y-10">
              <section className="space-y-6">
                <h4 className="text-[#0d4a8a] font-black text-xs uppercase tracking-[4px] border-b-4 border-blue-50 pb-4 italic flex items-center gap-3">
                  <Church size={18} /> Dados Gerais do Templo
                </h4>
                <div className="space-y-5">
                  <Campo label="Nome da Congregação">
                    <input type="text" value={cong.nome} onChange={e => onUpdate(index, 'nome', e.target.value)}
                      className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[28px] px-8 py-5 font-black text-[#0d4a8a] outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner text-lg" />
                  </Campo>
                  <Campo label="Endereço Completo">
                    <input type="text" value={cong.endereco} onChange={e => onUpdate(index, 'endereco', e.target.value)}
                      className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[24px] px-8 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" placeholder="Rua, número, bairro, cidade - UF" />
                  </Campo>
                  <Campo label="Data de Inauguração / Início do Trabalho">
                    <input type="date" value={cong.dataInauguracao} onChange={e => onUpdate(index, 'dataInauguracao', e.target.value)}
                      className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[24px] px-8 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" />
                  </Campo>
                  <Campo label="Obreiro Responsável pela Congregação">
                    <input list="lista-obreiros" type="text" value={cong.responsavelNome} onChange={e => onUpdate(index, 'responsavelNome', e.target.value)}
                      className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[24px] px-8 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" placeholder="Ex: Pr. Fulano de Tal" />
                  </Campo>
                </div>
              </section>

              {/* OBREIROS */}
              <section className="space-y-6">
                <h4 className="text-[#0d4a8a] font-black text-xs uppercase tracking-[4px] border-b-4 border-blue-50 pb-4 italic flex items-center gap-3">
                  <Users size={18} /> Obreiros desta Congregação ({obreirosDaCong.length})
                </h4>
                {obreirosDaCong.length === 0 ? (
                  <div className="bg-slate-50 rounded-[24px] px-8 py-8 text-center">
                    <p className="text-slate-400 text-sm font-bold">Nenhum obreiro vinculado a esta congregação.</p>
                    <p className="text-slate-300 text-[10px] font-bold mt-2">Vá até a aba "Obreiros" e defina a congregação de cada um.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {obreirosDaCong.map((o, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full text-white ${
                            o.cargo === 'Pr.' ? 'bg-blue-700' : o.cargo === 'Pb.' ? 'bg-blue-500' : o.cargo === 'Dc.' ? 'bg-teal-600' : 'bg-slate-500'
                          }`}>{o.cargo}</span>
                          <span className="font-bold text-slate-700 text-sm">{o.nome}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* COL 2: DEPARTAMENTOS */}
            <div className="space-y-10">
              <section className="space-y-6">
                <h4 className="text-[#0d4a8a] font-black text-xs uppercase tracking-[4px] border-b-4 border-blue-50 pb-4 italic flex items-center gap-3">🏛️ Departamentos & Ministérios</h4>
                <div className="space-y-5">
                  {TIPOS_DEPARTAMENTO.map(tipoDep => {
                    const dep = cong.departamentos?.find(d => d.tipo === tipoDep.id);
                    return (
                      <div key={tipoDep.id} className={`rounded-[24px] border-2 p-6 space-y-4 transition-all ${dep ? 'bg-white border-[#c5d8ef] shadow-sm' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`${tipoDep.cor} text-white w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm`}>{tipoDep.icon}</span>
                            <div>
                              <h5 className="font-black text-sm text-[#0d4a8a] uppercase tracking-wider">{tipoDep.label}</h5>
                              {!dep && <p className="text-[9px] text-slate-400 font-bold">Clique em "Ativar" para configurar</p>}
                            </div>
                          </div>
                          <button onClick={() => onToggleDepartamento(index, tipoDep.id)}
                            className={`text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all ${dep ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-[#0d4a8a] text-white hover:bg-blue-700'}`}
                          >{dep ? 'Desativar' : 'Ativar'}</button>
                        </div>
                        {dep && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <SubCampo label="Dirigente" value={dep.dirigente} onChange={v => onUpdateDepartamento(index, tipoDep.id, 'dirigente', v)} />
                            <SubCampo label="Vice-Dirigente" value={dep.viceDirigente} onChange={v => onUpdateDepartamento(index, tipoDep.id, 'viceDirigente', v)} />
                            <SubCampo label="Secretária(o)" value={dep.secretaria} onChange={v => onUpdateDepartamento(index, tipoDep.id, 'secretaria', v)} />
                            <SubCampo label="Vice-Secretária(o)" value={dep.viceSecretaria} onChange={v => onUpdateDepartamento(index, tipoDep.id, 'viceSecretaria', v)} />
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                              <label className="text-[8px] font-black uppercase text-slate-400 tracking-[2px]">Data de Criação</label>
                              <input type="date" value={dep.dataCriacao} onChange={e => onUpdateDepartamento(index, tipoDep.id, 'dataCriacao', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest px-14">
          <span>Dados salvos automaticamente</span>
          <div className="flex gap-4">
            <button onClick={() => { if(confirm(`Excluir "${cong.nome}" permanentemente?`)) { onDelete(index); onClose(); } }}
              className="bg-red-50 text-red-400 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all">Excluir Templo</button>
            <button onClick={onClose} className="bg-[#0d4a8a] text-white px-12 py-3 rounded-full shadow-2xl hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest">Concluir Edição</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-[3px]">{label}</label>
      {children}
    </div>
  );
}

function SubCampo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[8px] font-black uppercase text-slate-400 tracking-[2px]">{label}</label>
      <input list="lista-obreiros" type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-5 py-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" placeholder="Nome" />
    </div>
  );
}
