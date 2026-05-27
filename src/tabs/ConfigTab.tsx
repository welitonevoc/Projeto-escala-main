import { Save, RefreshCw, Settings } from 'lucide-react';

interface Props {
  saving: boolean;
  isConfigured: boolean | null;
  onSave: () => void;
  onAplicarRegras: () => void;
}

export function ConfigTab({ saving, isConfigured, onSave, onAplicarRegras }: Props) {
  return (
    <div className="space-y-10">
      <div className="bg-[#0e3d6e] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="relative z-10 flex flex-col gap-4">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Painel de Sincronização</h2>
          <p className="text-blue-300 font-bold text-sm leading-relaxed max-w-lg">
            Mantenha sua base de dados atualizada entre o painel local e a planilha do Google Sheets.
          </p>
          {isConfigured && (
            <span className="text-green-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">☁️ Modo Online (API configurada)</span>
          )}
          {isConfigured === false && (
            <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">💾 Modo Local (dados salvos apenas no navegador)</span>
          )}
        </div>
        <div className="flex gap-4 relative z-10">
          <button onClick={onSave} disabled={saving}
            className="bg-amber-400 text-black px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[2px] hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center gap-4">
            {saving ? <RefreshCw className="animate-spin" /> : <Save />} {saving ? "Salvando..." : "Sincronizar Nuvem"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[40px] border border-[#c5d8ef] shadow-xl">
          <h3 className="text-lg font-black text-blue-900 mb-6 uppercase tracking-widest flex items-center gap-3 italic">
            <Settings size={22} className="text-blue-500" /> Automação
          </h3>
          <button onClick={onAplicarRegras}
            className="w-full bg-[#0d4a8a] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-[3px] hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-4">
            🌀 Executar Robô de Escala
          </button>
        </div>
        <div className="bg-white p-10 rounded-[40px] border border-[#c5d8ef] shadow-xl">
          <h3 className="text-lg font-black text-blue-900 mb-6 uppercase tracking-widest flex items-center gap-3 italic">
            <Settings size={22} className="text-blue-500" /> Informações
          </h3>
          <div className="text-slate-600 text-sm font-bold leading-relaxed space-y-3">
            <p>Os dados são salvos automaticamente no navegador (localStorage).</p>
            <p>A sincronização com a nuvem envia todos os dados para o Google Sheets.</p>
            <p>O "Robô de Escala" aplica as regras automáticas de culto com base na semana do mês.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
