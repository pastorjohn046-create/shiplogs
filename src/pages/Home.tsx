import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, ShieldCheck, Clock, Globe, Zap, BarChart3, Users, ArrowRight, Plane, Ship, MapPin, MessageSquare, Menu, X as CloseIcon } from 'lucide-react';
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
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-6 py-3 md:py-4 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-[#001f3f] p-2 rounded-xl"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <span className={`text-xl font-black tracking-tighter uppercase ${isScrolled ? 'text-[#001f3f]' : 'text-white'}`}>
              Swift<span className="text-orange-500">Tracks</span>
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              {['Services', 'Network', 'About'].map((item) => (
                <button 
                  key={item}
                  onClick={() => navigate(`/${item.toLowerCase()}`)}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                    isScrolled ? 'text-[#001f3f] hover:text-orange-500' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    isScrolled 
                      ? 'text-orange-500 hover:text-[#001f3f]' 
                      : 'text-orange-500 hover:text-white'
                  }`}
                >
                  Admin Panel
                </button>
              )}
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    isScrolled 
                      ? 'bg-[#001f3f] text-white hover:bg-orange-500' 
                      : 'bg-white text-[#001f3f] hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                    isScrolled 
                      ? 'bg-[#001f3f] text-white hover:bg-orange-500' 
                      : 'bg-white text-[#001f3f] hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors ${
                isScrolled ? 'text-[#001f3f]' : 'text-white'
              }`}
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 p-6 flex flex-col gap-4 md:hidden"
            >
              {['Services', 'Network', 'About'].map((item) => (
                <button 
                  key={item}
                  className="w-full text-left py-4 text-lg font-black text-[#001f3f] uppercase tracking-tighter italic border-b border-gray-50"
                  onClick={() => {
                    navigate(`/${item.toLowerCase()}`);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
              <div className="pt-4 flex flex-col gap-4">
                {isAdmin && (
                  <button 
                    onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
                  >
                    Admin Panel
                  </button>
                )}
                {user ? (
                  <button 
                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button 
                    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                    className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-0 overflow-hidden bg-[#001f3f]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.3
              }}
              animate={{ 
                y: [null, Math.random() * -100 - 50],
                opacity: [null, 0]
              }}
              transition={{ 
                duration: Math.random() * 5 + 5, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          style={{ y: y1, opacity }}
          className="relative z-10 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6 md:mb-8"
          >
            <span className="text-orange-500 text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Next-Gen Logistics</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-[120px] font-black text-white mb-6 md:mb-8 leading-[0.85] uppercase tracking-tighter italic">
            The Future <br />
            <span className="text-orange-500">of Delivery</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Revolutionizing global supply chains with real-time intelligence, 
            unmatched security, and a network that never sleeps.
          </p>

          <form onSubmit={handleSearch} className="relative group max-w-3xl mx-auto w-full">
            <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl md:rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative flex flex-col md:flex-row items-center bg-white rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden p-2 md:p-3 border border-white/10">
              <div className="flex-1 flex items-center w-full px-4">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mr-3 md:mr-4" />
                <input
                  type="text"
                  placeholder="TRACKING ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full py-4 md:py-5 text-lg md:text-xl text-[#001f3f] outline-none font-black placeholder:text-gray-300 placeholder:font-bold uppercase tracking-tight"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-[#001f3f] text-white px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center justify-center gap-3 group/btn"
              >
                <span>Track</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Marquee Section */}
        <div className="absolute bottom-0 left-0 right-0 py-8 bg-white/5 backdrop-blur-sm border-t border-white/10 overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...cities, ...cities].map((city, i) => (
              <div key={i} className="flex items-center mx-12">
                <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-white/40 text-sm font-black uppercase tracking-widest">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex p-4 bg-gray-50 rounded-2xl mb-6 group-hover:bg-orange-500 transition-colors duration-500">
                  <stat.icon className="w-8 h-8 text-[#001f3f] group-hover:text-white transition-colors duration-500" />
                </div>
                <div className="text-5xl font-black text-[#001f3f] mb-2 tracking-tighter italic">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Network Section */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Global Network</h2>
            <h3 className="text-5xl md:text-7xl font-black text-[#001f3f] uppercase tracking-tighter italic">Live <span className="text-gray-300">Operations</span></h3>
          </div>
          
          <div className="relative h-[600px] bg-[#001f3f] rounded-[4rem] shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080?blur=10')] bg-cover bg-center" />
            </div>
            
            {/* Moving Shipment Indicators */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 80 + 10 + "%", 
                  y: Math.random() * 80 + 10 + "%",
                  scale: 0.5,
                  opacity: 0
                }}
                animate={{ 
                  x: [null, Math.random() * 80 + 10 + "%"],
                  y: [null, Math.random() * 80 + 10 + "%"],
                  scale: [0.5, 1, 0.5],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute"
              >
                <div className="bg-orange-500 p-3 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                  {i % 2 === 0 ? <Plane className="w-5 h-5 text-white" /> : <Truck className="w-5 h-5 text-white" />}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">LT-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                </div>
              </motion.div>
            ))}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-8xl font-black text-white/10 uppercase tracking-tighter italic select-none">Global Coverage</div>
              </div>
            </div>

            <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">Real-Time Intelligence</h4>
                  <p className="text-gray-400 text-sm font-medium">Every shipment is tracked with millisecond precision across our global grid.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-[#001f3f] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl whitespace-nowrap"
              >
                Join the Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Our Expertise</h2>
              <h3 className="text-5xl md:text-7xl font-black text-[#001f3f] leading-[0.9] uppercase tracking-tighter italic">
                Logistics Without <br />
                <span className="text-gray-300">Boundaries</span>
              </h3>
            </div>
            <p className="text-gray-500 max-w-sm font-medium leading-relaxed">
              From local last-mile delivery to complex international freight, 
              we provide the infrastructure for global commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 group cursor-pointer"
              >
                <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-black text-[#001f3f] mb-4 uppercase tracking-tight">{service.title}</h4>
                <p className="text-gray-500 leading-relaxed mb-8 font-medium">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-widest text-xs">
                  Explore Service <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-32 px-6 bg-[#001f3f] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Globe className="w-full h-full scale-150 translate-x-1/4" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-6xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter italic mb-10">
                Global <br />
                <span className="text-orange-500">Presence</span>
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">Rapid Response</h4>
                    <p className="text-gray-400 leading-relaxed">Our automated routing system finds the fastest path for your shipment in milliseconds.</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="bg-white/10 p-4 rounded-2xl">
                    <ShieldCheck className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">End-to-End Security</h4>
                    <p className="text-gray-400 leading-relaxed">Blockchain-backed tracking ensures your data and packages are tamper-proof.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center p-12 overflow-hidden">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="relative w-full h-full"
                >
                  <Globe className="w-full h-full text-orange-500/20" />
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.8)]"
                      style={{
                        top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                        left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                      }}
                    />
                  ))}
                </motion.div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <div className="text-6xl font-black mb-2 italic">180+</div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Strategic Hubs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-orange-500 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
          <h2 className="text-5xl md:text-8xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic mb-10 relative z-10">
            Ready to <br />
            <span className="text-white">Ship?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-[#001f3f] text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto bg-white text-[#001f3f] px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Contact Sales
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001f3f] text-white py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-orange-500 p-2 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase">Swift<span className="text-orange-500">Tracks</span></span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed font-medium">
                The world's most advanced logistics platform. 
                Built for the speed of modern commerce.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => navigate('/network')} className="hover:text-white transition-colors">Network</button></li>
                <li><button onClick={() => navigate('/support')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-8">Support</h4>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">© 2026 SwiftTracks Logistics. All rights reserved.</p>
            <div className="flex gap-8">
              {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                <a key={social} href="#" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating CS Button */}
      <motion.a
        href="https://t.me/SwiftTracksBeige"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[100] bg-blue-500 text-white p-4 md:p-5 rounded-full shadow-2xl flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
        <span className="hidden md:block absolute right-full mr-4 bg-[#001f3f] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Live Support
        </span>
      </motion.a>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
