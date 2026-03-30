import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../App';

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001f3f] text-white p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-[#001f3f] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
        
        <div className="flex justify-center mb-8">
          <div className="bg-[#001f3f] p-5 rounded-3xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
            {isRegistering ? <UserPlus className="w-10 h-10 text-orange-500" /> : <LogIn className="w-10 h-10 text-orange-500" />}
          </div>
        </div>

        <h1 className="text-4xl font-black text-center mb-2 uppercase tracking-tighter italic">
          Swift <span className="text-orange-500">Tracks</span>
        </h1>
        <p className="text-gray-400 text-center mb-10 font-bold uppercase tracking-widest text-[10px]">
          {isRegistering ? 'Create your global account' : 'Sign in to your dashboard'}
        </p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
              />
            </div>
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#001f3f] text-white py-5 px-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all duration-300 shadow-xl disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        
        <div className="space-y-4">
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="w-full text-xs text-[#001f3f] font-black uppercase tracking-widest hover:text-orange-500 transition-colors"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 font-black uppercase tracking-widest hover:text-[#001f3f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
