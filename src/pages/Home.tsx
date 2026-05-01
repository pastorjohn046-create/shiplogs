import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, Clock, Globe, Zap, BarChart3, Users, ArrowRight, Plane, Ship, MapPin, MessageSquare, Menu, X as CloseIcon } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';

const stats = [
  { label: 'Packages Delivered', value: '2.4M+', icon: Package },
  { label: 'Countries Covered', value: '180+', icon: Globe },
  { label: 'Happy Clients', value: '50k+', icon: Users },
  { label: 'Success Rate', value: '99.9%', icon: BarChart3 },
];

const services = [
  {
    title: 'Air Freight',
    description: 'Express delivery across continents with our dedicated air fleet.',
    icon: Plane,
    color: 'bg-blue-500',
  },
  {
    title: 'Ocean Cargo',
    description: 'Cost-effective global shipping for large-scale logistics.',
    icon: Ship,
    color: 'bg-indigo-500',
  },
  {
    title: 'Land Transport',
    description: 'Reliable door-to-door delivery with real-time route optimization.',
    icon: Truck,
    color: 'bg-orange-500',
  },
];

const cities = ['New York', 'London', 'Tokyo', 'Dubai', 'Singapore', 'Berlin', 'Sydney', 'Paris', 'Hong Kong', 'Toronto'];

export default function Home() {
  const [trackingId, setTrackingId] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/track/${trackingId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-6 py-4 md:py-6 ${
        isScrolled ? 'nexus-glass shadow-lg border-b border-white/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="bg-[#001f3f] p-2.5 rounded-2xl shadow-xl"
            >
              <Zap className="w-6 h-6 text-orange-500" />
            </motion.div>
            <span className={`text-base md:text-xl font-black tracking-tighter uppercase ${isScrolled ? 'text-[#001f3f]' : 'text-white'}`}>
              Peak<span className="text-orange-500 hidden sm:inline">Logistics</span><span className="text-orange-500 sm:hidden">Lg.</span>
            </span>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-10">
              {['Services', 'Network', 'About'].map((item) => (
                <button 
                  key={item}
                  onClick={() => navigate(`/${item.toLowerCase()}`)}
                  className={`text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-orange-500 ${
                    isScrolled ? 'text-slate-600' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <button 
                  onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-600/20 transition-all active:scale-95"
                >
                  Console Panel
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className={`px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl ${
                    isScrolled ? 'bg-[#001f3f] text-white' : 'bg-white text-[#001f3f] hover:bg-orange-600 hover:text-white'
                  }`}
                >
                  Access Portal
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-3 rounded-2xl bg-orange-600 text-white shadow-lg`}
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-full left-4 right-4 mt-4 nexus-glass rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-4 lg:hidden border border-white/20"
            >
              {['Services', 'Network', 'About'].map((item) => (
                <button 
                  key={item}
                  className="w-full text-left py-5 text-2xl font-black text-[#001f3f] uppercase tracking-tighter italic border-b border-slate-100"
                  onClick={() => {
                    navigate(`/${item.toLowerCase()}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 flex flex-col gap-4">
                {user ? (
                  <button 
                    onClick={() => { navigate(isAdmin ? '/admin' : '/dashboard'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-orange-600/20 underline-offset-4"
                  >
                    Control Console
                  </button>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#001f3f] text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero: Global Operational Excellence */}
      <header className="relative min-h-screen flex items-center justify-center nexus-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,#001f3f_80%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center w-full">
          <motion.div 
            style={{ y: y1, opacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Operational Fluidity</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-[110px] font-black text-white mb-8 leading-[0.85] uppercase tracking-tighter italic">
              Global <br />
              <span className="text-orange-500">Logistics</span> <br />
              Console
            </h1>
            
            <p className="text-lg md:text-xl text-white/60 mb-12 max-w-xl font-medium leading-relaxed">
              Propelling global commerce forward with real-time intelligence, 
              unmatched security, and a network of precision hubs.
            </p>

            <form onSubmit={handleSearch} className="relative group max-w-xl w-full">
              <div className="absolute -inset-4 bg-orange-600/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              <div className="relative flex flex-col md:flex-row items-center bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden p-2.5 border border-white/10">
                <div className="flex-1 flex items-center w-full px-6">
                  <Package className="w-6 h-6 text-slate-300 mr-4" />
                  <input
                    type="text"
                    placeholder="GLOBAL TRACKING ID"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full py-5 text-xl text-[#001f3f] outline-none font-black placeholder:text-slate-300 uppercase tracking-tight"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto bg-[#001f3f] text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  <span>Locate</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>

          {/* Abstract Data Visualizer */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute inset-0 bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="relative z-10 nexus-glass rounded-[4rem] p-12 overflow-hidden border-white/10">
              <div className="grid grid-cols-2 gap-8 relative z-20">
                {stats.map((stat, i) => (
                  <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-orange-500/20 transition-colors group">
                    <stat.icon className="w-8 h-8 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
                    <div className="text-4xl font-black text-white mb-2 italic tracking-tighter">{stat.value}</div>
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-8 bg-[#001f3f]/50 rounded-[3rem] border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Operations</span>
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1 h-4 bg-orange-500/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                  </div>
                </div>
                <div className="space-y-4">
                  {['NXT-442-TY (Dubai)', 'NXT-109-LA (London)', 'NXT-882-QX (Tokyo)'].map(hub => (
                    <div key={hub} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] font-black text-white italic">{hub}</span>
                      <span className="text-[9px] font-bold text-green-500 uppercase">Transit</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Global Cities Marquee */}
        <div className="absolute bottom-0 left-0 right-0 py-10 bg-[#001f3f]/40 backdrop-blur-md border-t border-white/10 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...cities, ...cities].map((city, i) => (
              <div key={i} className="flex items-center mx-16">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-4 shadow-[0_0_10px_#f97316]" />
                <span className="text-white font-black uppercase tracking-[0.3em] text-[11px] opacity-40">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Services Grid: Premium Industrial Card Flow */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-2xl">
              <div className="text-orange-600 font-black uppercase tracking-[0.5em] text-[10px] mb-6">Infrastructural Might</div>
              <h2 className="text-5xl md:text-7xl font-black text-[#001f3f] leading-[0.9] uppercase tracking-tighter italic">
                Precision <br />
                <span className="text-slate-300">Engineering.</span>
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed border-l-2 border-orange-600 pl-8">
              We orchestrate the movement of millions of packages across 180 countries using elite autonomous logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/services')}
                className="nexus-card p-12 group cursor-pointer"
              >
                <div className={`${service.color} w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <service.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-2xl font-black text-[#001f3f] mb-6 uppercase tracking-tighter italic">
                  {service.title.split(' ')[0]} <span className="text-orange-600">{service.title.split(' ')[1] || ''}</span>
                </h4>
                <p className="text-slate-500 leading-relaxed mb-10 font-medium italic">
                  {service.description}
                </p>
                <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-[10px] group-hover:translate-x-3 transition-transform">
                  Operational Details <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Operations Network */}
      <section className="py-40 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-orange-600 font-black uppercase tracking-[0.6em] text-[10px] mb-6">Real-Time Infrastructure</div>
            <h2 className="text-5xl md:text-8xl font-black text-[#001f3f] uppercase tracking-tighter italic">Live <span className="text-slate-300">Operations.</span></h2>
          </div>
          
          <div className="relative h-[700px] nexus-gradient rounded-[4rem] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80')] bg-cover" />
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#001f3f_100%)]" />
            
            {/* Animated Hubs */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 80 + 10 + "%", 
                  y: Math.random() * 80 + 10 + "%",
                  opacity: 0
                }}
                animate={{ 
                  scale: [0, 1, 0.5],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: Math.random() * 4 + 4, 
                  repeat: Infinity, 
                  delay: i * 0.5 
                }}
                className="absolute w-4 h-4 bg-orange-500 rounded-full blur-sm"
              />
            ))}

            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="grid lg:grid-cols-2 gap-20 items-center w-full">
                <div className="nexus-glass p-12 rounded-[3.5rem] border border-white/10 max-w-xl">
                  <Globe className="w-16 h-16 text-orange-500 mb-10 animate-spin-slow" />
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-6">Autonomous Global <span className="text-orange-500">Grid.</span></h4>
                  <p className="text-white/60 font-medium leading-relaxed mb-10 text-lg">
                    Our proprietary Peak AI orchestrates over 1.2 million data points per second, ensuring your cargo bypasses global bottlenecks automatically.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-2xl font-black text-white">42ms</div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Route Latency</div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-2xl font-black text-white">100%</div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">Encryption</div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block space-y-8">
                  {[
                    { location: 'Dubai Hub Alpha', status: 'Optimal', delay: '0.0s' },
                    { location: 'Singapore Port VII', status: 'High Traffic', delay: '0.4s' },
                    { location: 'London Gateway', status: 'Optimal', delay: '0.1s' },
                    { location: 'Panama Canal II', status: 'Optimal', delay: '0.0s' }
                  ].map((node, i) => (
                    <motion.div 
                      key={node.location}
                      initial={{ x: 50, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 nexus-glass rounded-3xl border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${node.status === 'Optimal' ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`} />
                        <span className="text-white font-black uppercase tracking-tighter text-sm italic">{node.location}</span>
                      </div>
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Delay: {node.delay}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate CTA Section */}
      <section className="py-40 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto nexus-gradient rounded-[4rem] p-12 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,31,63,0.3)]"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
          <h2 className="text-5xl md:text-9xl font-black text-white leading-[0.85] uppercase tracking-tighter italic mb-12 relative z-10">
            Peak <br />
            <span className="text-orange-500">Inbound.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-orange-600 text-white px-16 py-7 rounded-3xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl shadow-orange-600/40"
            >
              Initialize Operations
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white px-16 py-7 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all border border-white/20"
            >
              Consult Expert
            </button>
          </div>
        </motion.div>
      </section>

      {/* Modern Industrial Footer */}
      <footer className="bg-[#001f3f] text-white py-32 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-orange-600 p-3 rounded-2xl shadow-xl">
                  <Zap className="w-8 h-8 text-[#001f3f]" />
                </div>
                <span className="text-3xl font-black tracking-tighter uppercase">Peak<span className="text-orange-500">Logistics</span></span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed font-medium text-lg italic">
                Defined by Operational Precision. Driven by Global Intelligence. swiftship_logistics_global_protocol_v4.2
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-10">Protocols</h4>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-white/40">
                <li><button onClick={() => navigate('/about')} className="hover:text-orange-500 transition-colors">Strategic Pillars</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-orange-500 transition-colors">Manifesto</button></li>
                <li><button onClick={() => navigate('/network')} className="hover:text-orange-500 transition-colors">Global Hubs</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 mb-10">Intelligence</h4>
              <ul className="space-y-6 text-sm font-black uppercase tracking-widest text-white/40">
                <li><button onClick={() => navigate('/news')} className="hover:text-orange-500 transition-colors">Market Pulse</button></li>
                <li><button onClick={() => navigate('/track')} className="hover:text-orange-500 transition-colors">Live Manifest</button></li>
                <li><button onClick={() => navigate('/support')} className="hover:text-orange-500 transition-colors">Secure Uplink</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">© 2026 Peak Logistics Partners. Certified Global Standards.</p>
            <div className="flex gap-12">
              {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-orange-500 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
