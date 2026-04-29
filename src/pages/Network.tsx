import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, MapPin, Truck, Plane, Ship, ArrowLeft, Zap, ShieldCheck, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const hubs = [
  { city: 'New York', region: 'North America', status: 'Active', icon: Truck },
  { city: 'London', region: 'Europe', status: 'Active', icon: Plane },
  { city: 'Tokyo', region: 'Asia', status: 'Active', icon: Ship },
  { city: 'Dubai', region: 'Middle East', status: 'Active', icon: Plane },
  { city: 'Singapore', region: 'Asia Pacific', status: 'Active', icon: Ship },
  { city: 'Berlin', region: 'Europe', status: 'Active', icon: Truck },
  { city: 'Sydney', region: 'Oceania', status: 'Active', icon: Plane },
  { city: 'Paris', region: 'Europe', status: 'Active', icon: Truck },
  { city: 'Hong Kong', region: 'Asia', status: 'Active', icon: Ship },
  { city: 'Toronto', region: 'North America', status: 'Active', icon: Truck },
];

export default function Network() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#001f3f] p-2 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-[#001f3f]">
              Nexus<span className="text-orange-500">Logistics</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#001f3f] hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
        </div>
      </nav>

      <main className="pt-24 md:pt-32 pb-32 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 md:mb-20">
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Global Infrastructure</h2>
            <h1 className="text-4xl md:text-8xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic mb-6 md:mb-8">
              The Network <br />
              <span className="text-gray-300">That Never Sleeps</span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
              With strategic hubs in over 180 countries, we provide truly global coverage. 
              Our network is built on real-time intelligence and unmatched security.
            </p>
          </header>

          <div className="relative h-[300px] md:h-[500px] bg-[#001f3f] rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden mb-12 md:mb-20 group">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080?blur=10')] bg-cover bg-center" />
            </div>
            
            {/* Moving Shipment Indicators */}
            {[...Array(8)].map((_, i) => (
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
                <div className="bg-orange-500 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                  {i % 2 === 0 ? <Plane className="w-3 h-3 md:w-5 md:h-5 text-white" /> : <Truck className="w-3 h-3 md:w-5 md:h-5 text-white" />}
                </div>
              </motion.div>
            ))}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl md:text-8xl font-black text-white/10 uppercase tracking-tighter italic select-none">Global Coverage</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {hubs.map((hub, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-orange-500 transition-colors duration-500">
                    <hub.icon className="w-6 h-6 text-[#001f3f] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-700">{hub.status}</span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-[#001f3f] mb-2 uppercase tracking-tight italic">{hub.city}</h3>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">{hub.region}</p>
              </motion.div>
            ))}
          </div>

          {/* Network Stats */}
          <section className="mt-20 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-[#001f3f] mb-2 tracking-tighter italic">180+</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-[#001f3f] mb-2 tracking-tighter italic">2.4M+</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Deliveries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-[#001f3f] mb-2 tracking-tighter italic">50k+</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-[#001f3f] mb-2 tracking-tighter italic">99.9%</div>
              <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400">Success Rate</div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-[#001f3f] text-white py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Shield className="w-6 h-6 text-[#001f3f]" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Nexus<span className="text-orange-500">Logistics</span></span>
          </div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">© 2026 Nexus Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
