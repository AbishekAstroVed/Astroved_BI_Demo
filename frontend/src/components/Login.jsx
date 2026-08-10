import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, BarChart2, PieChart, Activity } from 'lucide-react';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(email, password);
      setIsLoading(false);
      onLogin(response.user, response.permissions, response.token);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f6fc] p-4 relative overflow-hidden font-sans">

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#6868f9]/5 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#6868f9]/5 blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Main Container */}
      <div className="w-full max-w-[1000px] min-h-[600px] md:h-[640px] bg-white rounded-[32px] shadow-[0_24px_64px_rgba(30,41,59,0.08)] flex flex-col md:flex-row overflow-hidden relative z-10">

        {/* Left Pane - Branding & Graphic (Hidden on mobile) */}
        <div className="hidden md:flex w-[45%] bg-gradient-to-b from-[#696cf8] to-[#5153df] p-10 flex-col relative overflow-hidden text-white">

          {/* Abstract background waves/lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M-50,200 C100,100 200,300 450,150" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M-50,300 C150,250 250,450 450,250" stroke="white" strokeWidth="0.5" />
              <path d="M-50,400 C100,450 300,200 450,350" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>


          {/* Mockup Graphic Area (Two Floating UI Cards) */}
          <div className="flex-1 w-full flex items-center justify-center z-10 relative mt-4 perspective-1000">

            {/* Left Card (Bar Chart) */}
            <div className="absolute left-[5%] top-[40%] -translate-y-1/2 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-[0_32px_64px_rgba(0,0,0,0.2)] transform rotate-y-6 -skew-y-3 hover:rotate-y-0 hover:skew-y-0 transition-transform duration-500 z-10 text-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-white/90">Analytics Overview</h3>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                  <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                </div>
              </div>

              {/* Chart area */}
              <div className="w-full h-24 flex items-end justify-between space-x-1.5 mb-4 border-b border-white/10 pb-2 relative">
                {/* fake y axis */}
                <div className="absolute left-0 top-0 bottom-2 w-4 flex flex-col justify-between text-[7px] text-white/50 font-mono">
                  <span>300</span>
                  <span>200</span>
                  <span>100</span>
                  <span>0</span>
                </div>
                {/* Bars */}
                <div className="flex-1 flex items-end justify-between space-x-2 ml-6 h-full pb-1">
                  <div className="w-full bg-white/30 rounded-t-sm h-[40%] hover:bg-white/50 transition-colors" />
                  <div className="w-full bg-white/60 rounded-t-sm h-[70%] hover:bg-white/80 transition-colors" />
                  <div className="w-full bg-white/40 rounded-t-sm h-[50%] hover:bg-white/60 transition-colors" />
                  <div className="w-full bg-white/80 rounded-t-sm h-[90%] hover:bg-white transition-colors" />
                  <div className="w-full bg-white/50 rounded-t-sm h-[100%] hover:bg-white/70 transition-colors" />
                  <div className="w-full bg-white/70 rounded-t-sm h-[60%] hover:bg-white/90 transition-colors" />
                </div>
              </div>

              {/* Stats area */}
              <div className="flex justify-between items-center bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="flex-1">
                  <p className="text-[9px] text-white/70 mb-1 font-semibold uppercase tracking-wider">Total Revenue</p>
                  <p className="text-sm font-bold text-white mb-1">$24.8<span className="text-[10px] text-white/80 font-medium">M</span></p>
                  <p className="text-[9px] text-emerald-300 flex items-center font-bold">
                    <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    +18.6%
                  </p>
                </div>
                <div className="w-px h-10 bg-white/20 mx-2"></div>
                <div className="flex-1 pl-1">
                  <p className="text-[9px] text-white/70 mb-1 font-semibold uppercase tracking-wider">Active Users</p>
                  <p className="text-sm font-bold text-white mb-1">12.6<span className="text-[10px] text-white/80 font-medium">K</span></p>
                  <p className="text-[9px] text-emerald-300 flex items-center font-bold">
                    <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    +12.4%
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card (Donut Chart) */}
            <div className="absolute right-[5%] top-[55%] -translate-y-1/2 w-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_32px_64px_rgba(0,0,0,0.2)] transform -rotate-y-6 skew-y-3 hover:rotate-y-0 hover:skew-y-0 transition-transform duration-500 z-20 text-white">
              <div className="w-full flex justify-center mb-6 mt-2">
                {/* CSS Donut Chart */}
                <div className="w-20 h-20 rounded-full border-[6px] border-white/20 relative shadow-inner">
                  <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-[#f97316] border-r-[#f97316] rotate-45" />
                  <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-l-white/60 -rotate-12" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-white/80 mb-1 font-bold uppercase tracking-wider">Growth Rate</p>
                <p className="text-3xl font-bold text-white leading-tight mb-1">68<span className="text-lg font-normal text-white/80">%</span></p>
                <p className="text-[9px] text-white/60 font-medium">vs last month</p>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="z-10 text-center mt-12 mb-8 flex flex-col items-center">
            <h1 className="text-[34px] font-extrabold mb-5 leading-[1.2] tracking-tight text-white">
              Smarter Insights.<br />
              <span className="text-transparent bg-clip-text bg-[#f97316]">
                Better Decisions.
              </span>
            </h1>

            <div className="w-16 h-1 bg-[#f97316] rounded-full mb-6 opacity-70" />

            <p className="text-[15px] text-indigo-100/80 leading-relaxed font-medium max-w-[320px]">
              AstroVed Business Intelligence<br />empowers your data to drive success.
            </p>
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="w-full md:w-[55%] p-6 md:p-14 flex flex-col items-center justify-center relative flex-1">

          <div className="w-full max-w-[360px] mx-auto flex flex-col items-center">

            {/* Logo & Header */}
            <div className="flex flex-col items-center mb-10 w-full text-center">
              <div className="flex items-center space-x-3 mb-4">
                {/* Official Logo */}
                <img
                  src="https://cdn.astroved.com/images/images-av/AstroVed-Logo.svg"
                  alt="AstroVed Logo"
                  className="h-10 max-w-full object-contain filter brightness-110"
                />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Business Intelligence</h2>

              {/* Divider */}
              <div className="w-full flex items-center justify-center mt-6">
                <div className="flex-1 h-px bg-slate-100" />
                <div className="w-1.5 h-1.5 bg-[#6868f9]/50 rounded-full mx-3 rotate-45" />
                <div className="flex-1 h-px bg-slate-100" />
              </div>
            </div>

            {error && (
              <div className="w-full p-3 mb-6 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-5">

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#6868f9] uppercase tracking-wider block">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#6868f9] transition-colors">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 focus:border-[#6868f9] rounded-2xl text-slate-800 text-sm placeholder-slate-300 focus:outline-none transition-all focus:ring-4 focus:ring-[#6868f9]/10"
                    placeholder="name@astroved.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#6868f9] uppercase tracking-wider block">Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-[#6868f9] transition-colors">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 focus:border-[#6868f9] rounded-2xl text-slate-800 text-sm placeholder-slate-300 focus:outline-none transition-all focus:ring-4 focus:ring-[#6868f9]/10 font-mono tracking-widest"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#6868f9] border-[#6868f9] shadow-sm' : 'border-slate-300 group-hover:border-[#6868f9]'}`}>
                    {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                  <span className="text-xs text-slate-600 font-medium select-none group-hover:text-slate-800 transition-colors">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-8 py-4 rounded-2xl bg-[#6868f9] hover:bg-[#5151d6] text-white font-bold flex items-center justify-center space-x-2 transition-all hover:shadow-[0_8px_24px_rgba(104,104,249,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Access BI Dashboard</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Bottom Footer */}
          <div className="w-full flex flex-col items-center justify-center px-6 md:px-10 mt-auto pb-4 pt-10">
            <div className="w-full max-w-[360px] flex items-center justify-center border-t border-slate-100 pt-6">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-medium">Secure & Trusted Enterprise Access</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

