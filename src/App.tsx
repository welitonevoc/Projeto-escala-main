import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { RefreshCw, Printer, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { AnimatePresence } from "motion/react";

import { ToastProvider, useToast } from "./hooks/useToast";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LoginModal } from "./components/LoginModal";
import { CongregacaoCard } from "./components/CongregacaoCard";
import { CongregacaoModal } from "./components/CongregacaoModal";
import { DuplicateModal } from "./components/DuplicateModal";
import { EscalaOficialTab } from "./tabs/EscalaOficialTab";
import { EscalaLocalTab } from "./tabs/EscalaLocalTab";
import { ObreirosTab } from "./tabs/ObreirosTab";
import { CalendarioTab } from "./tabs/CalendarioTab";
import { ConfigTab } from "./tabs/ConfigTab";
import { HistoriaTab } from "./tabs/HistoriaTab";

import type { Obreiro, Congregacao, EscalaOficialData, EscalaLocalItem, Evento, TipoCulto, RegraCulto, DuplicateData } from "./types";
import { criarDepartamentoVazio, DIAS_SEMANA_OFICIAL, DIAS_SEMANA_LOCAL, DIAS_SEMANA_PP, DIAS_SEMANA_PORTARIA, DIAS_OFFSET, CONGREGACOES_PADRAO, OBREIROS_PADRAO, ESCALA_LOCAL_PADRAO, TIPOS_CULTO_PADRAO, REGRAS_CULTO_PADRAO } from "./constants";

function getWeekOfMonth(date: Date) {
  return Math.ceil(date.getDate() / 7);
}

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("escala-oficial");
  const [dataInicio, setDataInicio] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"));
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [obreiros, setObreiros] = useLocalStorage<Obreiro[]>("obreiros", OBREIROS_PADRAO);
  const [congregacoes, setCongregacoes] = useLocalStorage<Congregacao[]>("congregacoes", CONGREGACOES_PADRAO);
  const [escalaOficial, setEscalaOficial] = useLocalStorage<EscalaOficialData>("escalaOficial", {});
  const [escalaLocal, setEscalaLocal] = useLocalStorage<EscalaLocalItem[]>("escalaLocal", ESCALA_LOCAL_PADRAO);
  const [eventos, setEventos] = useLocalStorage<Evento[]>("eventos", []);
  const [tiposCulto, setTiposCulto] = useLocalStorage<TipoCulto[]>("tiposCulto", TIPOS_CULTO_PADRAO);
  const [regrasCulto, setRegrasCulto] = useLocalStorage<RegraCulto[]>("regrasCulto", REGRAS_CULTO_PADRAO);

  const [editingCongregacao, setEditingCongregacao] = useState<number | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<DuplicateData | null>(null);

  const tabs = [
    { id: "escala-oficial", label: "📆 Escala Oficial" },
    { id: "escala-local", label: "📋 Escala Local" },
    { id: "congregacoes", label: "⛪ Congregações" },
    { id: "obreiros", label: "👥 Obreiros" },
    { id: "calendario", label: "📅 Calendário" },
    { id: "historia", label: "📜 História" },
    { id: "config", label: "⚙️ Configurações" },
  ];

  // Check status on mount only
  useEffect(() => {
    checkStatus();
  }, []);

  // Load data only when explicitly triggered
  const checkStatus = async () => {
    try {
      const res = await fetch("/api/status");
      setIsConfigured(res.ok ? (await res.json()).configured : false);
    } catch { setIsConfigured(false); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync");
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      setIsConfigured(true);

      if (data.obreiros?.length) setObreiros(data.obreiros.map((r: any) => ({ nome: r[0], cargo: r[1], congregacao: r[2] })));
      if (data.congregacoes?.length) setCongregacoes(data.congregacoes.map((r: any) => ({ nome: r[0], endereco: r[1], responsavelNome: r[2], dataInauguracao: r[3], departamentos: r[4] ? JSON.parse(r[4]) : [] })));

      const oficial: EscalaOficialData = {};
      data.escalaOficial?.forEach((row: any) => {
        if (row[0] === dataInicio) {
          if (!oficial[row[1]]) oficial[row[1]] = [];
          oficial[row[1]].push({ congregacao: row[2], codigo: row[3], escalados: row[4]?.split(",") || [] });
        }
      });
      if (Object.keys(oficial).length === 0) {
        DIAS_SEMANA_OFICIAL.forEach(dia => { oficial[dia.id] = (dia.filtros ?? []).map(cong => ({ congregacao: cong, codigo: "04", escalados: ["", "", ""] })); });
      }
      setEscalaOficial(oficial);

      const loadedLocal = data.escalaLocal?.map((r: any) => ({ categoria: r[1], data: r[2], local: r[3], codigo: r[4], escalados: r[5]?.split(",") || [] })) || [];
      setEscalaLocal(loadedLocal.length === 0 ? ESCALA_LOCAL_PADRAO : loadedLocal);
      setEventos(data.eventos?.map((r: any) => ({ id: Math.random().toString(36).substr(2, 9), data: r[0], descricao: r[1], cc: r[2], congregacao: r[3] })) || []);
      if (data.tiposCulto?.length) setTiposCulto(data.tiposCulto.map((r: any) => ({ nome: r[0], codigo: r[1] })));
      if (data.regrasCulto?.length) setRegrasCulto(data.regrasCulto.map((r: any) => ({ congregacao: r[0], dia: r[1], regraSemana: r.slice(2) })));

      addToast("success", "Dados sincronizados com sucesso!");
    } catch {
      addToast("error", "Erro ao baixar dados da nuvem. Usando dados locais.");
    } finally { setLoading(false); }
  };

  const saveData = async () => {
    setSaving(true);
    try {
      const reqs = [
        { range: "Obreiros!A:C", values: obreiros.map(o => [o.nome, o.cargo, o.congregacao]) },
        { range: "Congregacoes!A:E", values: congregacoes.map(c => [c.nome, c.endereco, c.responsavelNome, c.dataInauguracao, JSON.stringify(c.departamentos)]) },
        { range: "EscalaLocal!A:F", values: escalaLocal.map(l => [dataInicio, l.categoria, l.data, l.local, l.codigo, l.escalados.join(",")]) },
        { range: "Eventos!A:D", values: eventos.map(e => [e.data, e.descricao, e.cc, e.congregacao]) },
        { range: "TiposCulto!A:B", values: tiposCulto.map(t => [t.nome, t.codigo]) },
        { range: "RegrasCulto!A:G", values: regrasCulto.map(r => [r.congregacao, r.dia, ...r.regraSemana]) },
      ];
      const oficialRows: any[] = [];
      Object.entries(escalaOficial).forEach(([dia, items]) => items.forEach(item => oficialRows.push([dataInicio, dia, item.congregacao, item.codigo, item.escalados.join(",")])));
      reqs.push({ range: "EscalaOficial!A:E", values: oficialRows });

      for (const req of reqs) {
        await fetch("/api/sheets/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) });
      }
      addToast("success", "Dados salvos na nuvem!");
    } catch { addToast("error", "Erro ao salvar. Dados estão salvos localmente."); }
    finally { setSaving(false); }
  };

  const aplicarRegrasGerais = useCallback(() => {
    const start = parseISO(dataInicio);
    const newOficial = JSON.parse(JSON.stringify(escalaOficial));
    Object.keys(newOficial).forEach(diaId => {
      const weekNum = getWeekOfMonth(addDays(start, DIAS_OFFSET[diaId] || 0));
      newOficial[diaId] = (newOficial[diaId] || []).map((item: any) => {
        const regra = regrasCulto.find(r => r.congregacao === item.congregacao && r.dia === diaId);
        if (regra && regra.regraSemana[weekNum - 1]) {
          const type = tiposCulto.find(t => t.nome === regra.regraSemana[weekNum - 1]);
          return { ...item, codigo: type ? type.codigo : item.codigo };
        }
        return item;
      });
    });
    setEscalaOficial(newOficial);
    addToast("success", `Regras aplicadas para a ${getWeekOfMonth(start)}ª semana!`);
  }, [dataInicio, escalaOficial, regrasCulto, tiposCulto]);

  const verificarDuplicadoNoDia = useCallback((valor: string, diaId: string, localAtual: string) => {
    if (!valor) return;
    const escalasDaEscalaLocal = escalaLocal.filter(l => {
      const diaInfo = [...DIAS_SEMANA_LOCAL, ...DIAS_SEMANA_PP, ...DIAS_SEMANA_PORTARIA].find((d: any) => d.id === l.data);
      return diaInfo?.parent === diaId || diaInfo?.id === diaId;
    });
    const todasEscalas = [...(escalaOficial[diaId] || []), ...escalasDaEscalaLocal];
    for (const item of todasEscalas) {
      if (item.escalados?.includes(valor)) {
        const localConflito = 'local' in item ? item.local : item.congregacao;
        if (localConflito !== localAtual) {
          setDuplicateModal({ isOpen: true, worker: valor, congregacao: localConflito, diaLabel: diaId });
          return;
        }
      }
    }
  }, [escalaLocal, escalaOficial]);

  // Congregation helpers
  const updateCongregacao = useCallback((idx: number, field: string, value: any) => {
    setCongregacoes(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }, []);

  const updateDepartamento = useCallback((congIdx: number, tipo: string, field: string, value: string) => {
    setCongregacoes(prev => prev.map((c, i) => i === congIdx ? {
      ...c,
      departamentos: c.departamentos.map(d => d.tipo === tipo ? { ...d, [field]: value } : d)
    } : c));
  }, []);

  const toggleDepartamento = useCallback((congIdx: number, tipo: string) => {
    setCongregacoes(prev => prev.map((c, i) => {
      if (i !== congIdx) return c;
      const exists = c.departamentos.find(d => d.tipo === tipo);
      return {
        ...c,
        departamentos: exists
          ? c.departamentos.filter(d => d.tipo !== tipo)
          : [...c.departamentos, criarDepartamentoVazio(tipo, tipo)]
      };
    }));
  }, []);

  const deleteCongregacao = useCallback((idx: number) => {
    setCongregacoes(prev => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <div className="min-h-screen bg-[#eef3f9] text-[#0a2a4a] font-sans print:bg-white print:p-0">
      {/* Login Gate */}
      {!isAuthenticated && <LoginModal />}
      {isAuthenticated && (
        <>
          {/* Menu Fixo */}
          <div className="bg-white border-b-2 border-[#1a5fa0] sticky top-0 z-[50] no-print">
            <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-1 items-center">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-lg transition-all ${activeTab === tab.id ? 'bg-[#0d4a8a] text-white' : 'text-slate-500 hover:text-[#0d4a8a]'}`}>
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2 px-4">
                <span className="text-[8px] text-slate-400 font-bold">👤 Admin</span>
                <button onClick={logout} className="text-[9px] text-red-400 hover:text-red-600 font-black uppercase tracking-widest">Sair</button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            {(activeTab === "escala-oficial" || activeTab === "escala-local") && (
              <div className="bg-white p-12 rounded-[50px] border border-[#c5d8ef] shadow-2xl mb-12 overflow-hidden relative print:border-2 print:border-slate-300 print:shadow-none">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left space-y-6 flex-1">
                    <div className="space-y-0.5">
                      <p className="text-xl font-black text-[#0d4a8a] italic tracking-tight">Pr. Ailton José Alves</p>
                      <p className="text-[9px] font-black text-[#0d4a8a]/70 uppercase tracking-[4px]">Presidente da IEADPE</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xl font-black text-[#0d4a8a] italic tracking-tight">Pr. Severino Guilhermino</p>
                      <p className="text-[9px] font-black text-[#0d4a8a]/70 uppercase tracking-[4px]">Gestor da Filial</p>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/IEADPE.png" className="w-44 h-44 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="text-center md:text-right flex-1">
                    <h1 className="text-7xl font-black text-[#0d4a8a] tracking-tighter leading-none mb-1">IEADPE</h1>
                    <p className="text-sm font-black text-[#0d4a8a] tracking-[10px] uppercase pl-2">Araçoiaba - PE</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sync Bar */}
            <div className="bg-[#e6f0fa] px-8 py-3 rounded-full border-none shadow-sm mb-10 flex flex-wrap items-center justify-center gap-6 no-print max-w-fit mx-auto">
              <div className="flex items-center gap-3">
                <Calendar className="text-blue-600" size={20} />
                <label className="font-bold text-[#0a2a4a] text-sm">Semana de:</label>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                  className="bg-white border border-[#a8c8e8] rounded-full px-4 py-2 font-bold text-[#0d3d7a] outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 items-center">
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {isConfigured ? '☁️ Online' : '💾 Local'}
                </span>
                <button onClick={loadData} className="bg-[#0d4a8a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Sincronizando..." : "Sincronizar"}
                </button>
                <button onClick={() => { setActiveTab("escala-oficial"); setTimeout(() => window.print(), 100); }}
                  className="bg-[#0d4a8a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2">
                  <Printer size={14} /> Imprimir Oficial
                </button>
                <button onClick={() => { setActiveTab("escala-local"); setTimeout(() => window.print(), 100); }}
                  className="bg-[#2a6e2a] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2">
                  <Printer size={14} /> Imprimir Local
                </button>
              </div>
            </div>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === "escala-oficial" && (
                <EscalaOficialTab
                  escalaOficial={escalaOficial}
                  dataInicio={dataInicio}
                  obreiros={obreiros}
                  onUpdate={setEscalaOficial}
                  onDuplicateCheck={verificarDuplicadoNoDia}
                />
              )}
              {activeTab === "escala-local" && (
                <EscalaLocalTab
                  escalaLocal={escalaLocal}
                  dataInicio={dataInicio}
                  onUpdate={setEscalaLocal}
                  onDuplicateCheck={verificarDuplicadoNoDia}
                />
              )}
              {activeTab === "congregacoes" && (
                <div className="space-y-10">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-blue-900 uppercase italic tracking-tighter">Templos & Congregações</h2>
                    <button onClick={() => { setCongregacoes(prev => [...prev, { nome: "Nova Congregação", endereco: "", responsavelNome: "", dataInauguracao: "", departamentos: [] }]); setEditingCongregacao(congregacoes.length); }}
                      className="bg-[#0d4a8a] text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> Cadastrar Templo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {congregacoes.map((cong, idx) => (
                      <CongregacaoCard key={idx} cong={cong} obreiros={obreiros} onEdit={() => setEditingCongregacao(idx)} />
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "obreiros" && (
                <ObreirosTab obreiros={obreiros} congregacoes={congregacoes} onUpdate={setObreiros} />
              )}
              {activeTab === "calendario" && (
                <CalendarioTab eventos={eventos} onUpdate={setEventos} />
              )}
              {activeTab === "historia" && (
                <HistoriaTab
                  escalaOficial={escalaOficial}
                  escalaLocal={escalaLocal}
                  congregacoes={congregacoes}
                  obreiros={obreiros}
                />
              )}
              {activeTab === "config" && (
                <ConfigTab
                  saving={saving}
                  isConfigured={isConfigured}
                  onSave={saveData}
                  onAplicarRegras={aplicarRegrasGerais}
                />
              )}
            </main>
          </div>

          {/* Footer */}
          <footer className="mt-24 border-t border-[#c5d8ef] py-24 bg-white no-print">
            <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-12">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/IEADPE.png" className="w-24 h-24 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-1000" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 text-center">
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-[#0d4a8a] uppercase tracking-[6px] opacity-40">Gestão Eclesiástica</p>
                  <p className="text-lg font-black text-[#0d4a8a]/70 italic leading-none">IEADPE Filial Araçoiaba</p>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[6px]">Tecnologia & Fé</p>
                  <p className="text-lg font-black text-slate-400 italic leading-none">© 2026 Portal do Obreiro</p>
                </div>
              </div>
            </div>
          </footer>

          {/* Modals */}
          <AnimatePresence>
            {editingCongregacao !== null && (
              <CongregacaoModal
                cong={congregacoes[editingCongregacao]}
                index={editingCongregacao}
                obreiros={obreiros}
                onUpdate={updateCongregacao}
                onUpdateDepartamento={updateDepartamento}
                onToggleDepartamento={toggleDepartamento}
                onDelete={deleteCongregacao}
                onClose={() => setEditingCongregacao(null)}
              />
            )}
          </AnimatePresence>

          <DuplicateModal data={duplicateModal} onClose={() => setDuplicateModal(null)} />

          <datalist id="lista-obreiros">
            {obreiros.map((o, idx) => <option key={idx} value={`${o.cargo} ${o.nome}`} />)}
          </datalist>
        </>
      )}

      <style>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-white { border: none !important; box-shadow: none !important; }
          .shadow-xl, .shadow-2xl { box-shadow: none !important; }
          th { color: #000 !important; border-bottom: 2px solid #000 !important; }
          td { border-bottom: 1px solid #f0f0f0 !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        input:focus { transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
