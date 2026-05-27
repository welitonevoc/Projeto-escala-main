import { Save, RefreshCw, Settings } from 'lucide-react';

interface Props {
  saving: boolean;
  isConfigured: boolean | null;
  onSave: () => void;
  onAplicarRegras: () => void;
}

export function ConfigTab({ saving, isConfigured, onSave, onAplicarRegras }: Props) {
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="bg-[#0e3d6e] p-5 md:p-10 rounded-[24px] md:rounded-[40px] text-white shadow-md md:shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 md:gap-10">
        <div className="relative z-10 flex flex-col gap-2 md:gap-4">
          <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">Sincronização</h2>
          <p className="text-blue-300 font-bold text-[11px] md:text-sm leading-relaxed max-w-lg">
            Mantenha seus dados atualizados com o Google Sheets.
          </p>
          {isConfigured && (
            <span className="text-green-300 text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-2">☁️ Online</span>
          )}
          {isConfigured === false && (
            <span className="text-amber-300 text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-2">💾 Local</span>
          )}
        </div>
        <div className="flex gap-3 md:gap-4 relative z-10 w-full md:w-auto">
          <button onClick={onSave} disabled={saving}
            className="flex-1 md:flex-none bg-amber-400 text-black px-6 md:px-10 py-3 md:py-5 rounded-[16px] md:rounded-[24px] font-black text-[9px] md:text-xs uppercase tracking-[2px] hover:bg-white hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2 md:gap-4">
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} {saving ? "Salvando..." : "Sincronizar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
        <div className="bg-white p-5 md:p-10 rounded-[20px] md:rounded-[40px] border border-[#c5d8ef] shadow-sm md:shadow-xl">
          <h3 className="text-sm md:text-lg font-black text-blue-900 mb-4 md:mb-6 uppercase tracking-wider flex items-center gap-2 md:gap-3 italic">
            <Settings size={16} className="text-blue-500" /> Automação
          </h3>
          <button onClick={onAplicarRegras}
            className="w-full bg-[#0d4a8a] text-white py-3 md:py-5 rounded-[16px] md:rounded-[24px] font-black text-[9px] md:text-xs uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-md flex items-center justify-center gap-3">
            🌀 Robô de Escala
          </button>
        </div>
        <div className="bg-white p-5 md:p-10 rounded-[20px] md:rounded-[40px] border border-[#c5d8ef] shadow-sm md:shadow-xl">
          <h3 className="text-sm md:text-lg font-black text-blue-900 mb-4 md:mb-6 uppercase tracking-wider flex items-center gap-2 md:gap-3 italic">
            <Settings size={16} className="text-blue-500" /> Informações
          </h3>
          <div className="text-slate-600 text-[11px] md:text-sm font-bold leading-relaxed space-y-2 md:space-y-3">
            <p>Dados salvos automaticamente no navegador.</p>
            <p>Sincronização envia dados para o Google Sheets.</p>
            <p>Robô aplica regras de culto conforme a semana.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
