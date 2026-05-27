import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginModal() {
  const { isAuthenticated, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[#071f37]/98 z-[99999] flex items-center justify-center p-4 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[40px] w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <div className="bg-[#0e3d6e] py-12 px-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24" />
            <div className="relative z-10">
              <span className="text-5xl block mb-4">🔐</span>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Acesso Restrito</h2>
              <p className="text-blue-300 text-sm font-bold mt-2">Sistema de Escalas IEADPE</p>
            </div>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-[3px]">Senha de Administrador</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                onKeyDown={e => { if (e.key === 'Enter') {
                  if (login(password)) setOpen(false);
                  else setError(true);
                }}}
                className="w-full bg-slate-50 border border-[#c5d8ef] rounded-[20px] px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                placeholder="Digite a senha..."
                autoFocus
              />
              {error && <p className="text-red-500 text-xs font-bold px-2">Senha incorreta. Tente novamente.</p>}
            </div>
            <button
              onClick={() => {
                if (login(password)) setOpen(false);
                else setError(true);
              }}
              className="w-full bg-[#0d4a8a] text-white py-5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
            >
              Entrar no Sistema
            </button>
            <p className="text-[9px] text-center text-slate-300 font-bold">
              Apenas administradores autorizados
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
