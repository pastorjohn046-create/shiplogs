import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowLeft, Zap, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Tactical Background Visualizer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80')] bg-cover opacity-[0.03] grayscale scale-110" />
        
        {/* Animated Scanning Line */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-orange-600/20 z-10"
        />

        {/* Animated Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              opacity: [0.03, 0.08, 0.03],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[800px] h-[800px] bg-orange-600/[0.02] rounded-full blur-[180px]"
            style={{ 
              top: `${(i * 30) % 100}%`, 
              left: `${(i * 40) % 100}%` 
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="bg-black rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] p-8 md:p-12 overflow-hidden relative">
          {/* Internal Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-600/10 rounded-full blur-[60px]" />
          
          <div className="flex flex-col items-center mb-10 md:mb-12 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(234,88,12,0.4)] mb-8 border border-white/10"
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic text-center leading-none">
              SWIFT<span className="text-orange-500">ACCESS</span>
            </h1>
            
            <div className="flex items-center gap-3 mt-6">
              <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]" />
                <span className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em]">
                  {isRegistering ? 'Provisioning Identity' : 'Terminal Online'}
                </span>
              </div>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Protocol Error: {error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-6 md:space-y-7 relative z-10">
            <div className="space-y-2.5">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/30 px-1">Identifier</label>
              <div className="relative group overflow-hidden">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4.5 h-4.5 group-focus-within:text-orange-500 transition-colors z-20 pointer-events-none" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@swiftship.global"
                  className="w-full pl-16 pr-8 py-5 bg-[#050505] rounded-2xl outline-none border border-white/10 focus:border-orange-500 font-bold text-white transition-all placeholder:text-white/20 text-sm md:text-base selection:bg-orange-600/30 relative z-10"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-white/30 px-1">Clearance Key</label>
              <div className="relative group overflow-hidden">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4.5 h-4.5 group-focus-within:text-orange-500 transition-colors z-20 pointer-events-none" />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-16 pr-14 py-5 bg-[#050505] rounded-2xl outline-none border border-white/10 focus:border-orange-500 font-bold text-white transition-all placeholder:text-white/20 text-sm md:text-base selection:bg-orange-600/30 relative z-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 hover:text-orange-500 transition-colors focus:outline-none z-30"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              disabled={loading}
              type="submit"
              className="w-full bg-orange-600 text-white py-5 md:py-6 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] md:text-xs hover:bg-orange-500 transition-all duration-300 shadow-2xl shadow-orange-600/20 disabled:opacity-50 group flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? 'INITIALIZE IDENTITY' : 'AUTHORIZE SESSION'}
                  <div className="bg-white/10 group-hover:bg-white/20 p-1 rounded-lg transition-colors">
                    {isRegistering ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                  </div>
                </>
              )}
            </motion.button>
          </form>
          
          <div className="mt-10 md:mt-12 flex flex-col items-center gap-6 relative z-10">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }} 
              className="w-full text-[10px] md:text-xs text-orange-500 font-black uppercase tracking-[0.3em] hover:text-white transition-all py-4 border border-orange-500/30 rounded-2xl bg-orange-500/5 hover:bg-orange-500 active:scale-95"
            >
              {isRegistering ? 'Back to Authorize Session' : 'Request Security Registration'}
            </button>
            
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            
            <button 
              type="button"
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 text-[9px] text-white/20 font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Abort Operation
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-white/[0.05] text-[7px] font-black uppercase tracking-[0.8em]">
            System.Encrypted / SwiftShip Global Grid
          </p>
          <a 
            href="https://t.me/PeakLogisticsPartners"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.03] bg-white/[0.02] text-white/20 text-[8px] font-black uppercase tracking-widest hover:bg-orange-600/10 hover:text-orange-500 transition-all"
          >
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            Contact Tactical HQ
          </a>
        </div>
      </motion.div>
    </div>
  );
}
