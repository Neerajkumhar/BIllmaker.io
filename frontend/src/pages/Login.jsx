import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Incorrect credentials. Please try again.');
      } else if (err.message === 'Network Error' || (err.code && err.code === 'ERR_NETWORK')) {
        setError('Server unreachable. Ensure the backend is live.');
      } else {
        setError('An unexpected error occurred. Connection failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05110c] flex items-center justify-center p-4 md:p-10 font-sans relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 animate-fade-in">
        
        {/* Left Side: Visual Asset */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative group max-w-md lg:max-w-xl">
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.6)] border border-white/5 ring-1 ring-white/10 bg-[#05110c]">
              <img 
                src="/visuark-team.png" 
                alt="Visuark Team" 
                className="w-full h-auto object-cover transform transition-transform duration-1000 hover:scale-105" 
              />
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Console */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start max-w-md">
          {/* Header */}
          <div className="mb-10 text-center md:text-left space-y-2">
            <h1 className="text-5xl font-black text-white tracking-widest drop-shadow-sm">
              VISUARK
            </h1>
            <p className="text-emerald-400/50 text-[10px] font-bold uppercase tracking-[0.6em]">
              Admin Security Gateway
            </p>
          </div>

          {/* Premium Glassmorphism Console Card */}
          <div className="w-full bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 rounded-[32px] border border-white/[0.08] shadow-2xl ring-1 ring-white/10 relative overflow-hidden group/form">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-emerald-400/50 uppercase tracking-widest ml-1">Team Identity</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/[0.04] border border-white/[0.05] focus:border-emerald-500/30 text-white placeholder-white/10 rounded-2xl focus:outline-none transition-all duration-300 ring-0 focus:ring-4 focus:ring-emerald-500/5"
                    placeholder="sunil@visuark.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-emerald-400/50 uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-emerald-400 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/[0.04] border border-white/[0.05] focus:border-emerald-500/30 text-white placeholder-white/10 rounded-2xl focus:outline-none transition-all duration-300 ring-0 focus:ring-4 focus:ring-emerald-500/5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-[#05110c] font-black rounded-2xl shadow-[0_15px_30px_-5px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/50 active:scale-[0.98] transition-all duration-500 overflow-hidden ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                <span className="relative z-10">{isSubmitting ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}</span>
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center md:text-left">
            <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">&copy; 2026 Admin Portal Security • Established 2024</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}} />
    </div>
  );
};

export default Login;
