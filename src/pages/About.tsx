import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, Globe, ArrowLeft, Zap, BarChart3, Package } from 'lucide-react';
import { motion } from 'motion/react';

const values = [
  {
    title: 'Integrity',
    description: 'We build trust through transparency and unwavering commitment to our promises.',
    icon: Zap,
  },
  {
    title: 'Innovation',
    description: 'We leverage cutting-edge technology to solve the most complex logistics challenges.',
    icon: Zap,
  },
  {
    title: 'Excellence',
    description: 'We strive for perfection in every delivery, ensuring a 99.9% success rate.',
    icon: BarChart3,
  },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-[#001f3f] p-2 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase text-[#001f3f]">
              SwiftShip<span className="text-orange-500 hidden sm:inline">Logistics</span><span className="text-orange-500 sm:hidden">Lg.</span>
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
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Our Story</h2>
            <h1 className="text-4xl md:text-8xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic mb-6 md:mb-8">
              Moving The <br />
              <span className="text-gray-300">Future Forward</span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
              SwiftShip Logistics was founded with a simple mission: to make global logistics as seamless as local delivery. 
              Today, we are the backbone of modern commerce, moving millions of packages across the globe.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center mb-20 md:mb-32">
            <div className="relative px-4 md:px-0">
              <div className="aspect-square bg-[#001f3f] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://picsum.photos/seed/logistics/1000/1000" 
                  alt="Logistics" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12">
                  <div className="text-4xl md:text-6xl font-black text-white italic mb-2 tracking-tighter">2012</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">Founded in New York</div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-2 md:-bottom-10 md:-right-10 w-32 h-32 md:w-48 md:h-48 bg-orange-500 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center rotate-12">
                <Package className="w-12 h-12 md:w-20 md:h-20 text-white" />
              </div>
            </div>
            <div className="space-y-8 md:space-y-10 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-[#001f3f] uppercase tracking-tight italic">Our Vision</h2>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed font-medium">
                We believe that logistics should be invisible. Our goal is to build a world where products move 
                effortlessly from creators to consumers, powered by real-time intelligence and sustainable practices.
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="text-2xl md:text-4xl font-black text-[#001f3f] mb-2 italic">180+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Countries Covered</div>
                </div>
                <div className="p-6 md:p-8 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="text-2xl md:text-4xl font-black text-[#001f3f] mb-2 italic">50k+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Happy Clients</div>
                </div>
              </div>
            </div>
          </div>

          <section className="mb-20 md:mb-32">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Our Values</h2>
              <h3 className="text-3xl md:text-5xl font-black text-[#001f3f] uppercase tracking-tighter italic">What Drives <span className="text-gray-300">Us</span></h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {values.map((value, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 text-center group hover:border-orange-500/30 transition-all"
                >
                  <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-orange-500 transition-colors duration-500">
                    <value.icon className="w-8 h-8 text-[#001f3f] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-[#001f3f] mb-4 uppercase tracking-tight italic">{value.title}</h4>
                  <p className="text-gray-500 leading-relaxed font-medium text-sm">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-[#001f3f] rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
            <h2 className="text-3xl md:text-6xl font-black text-white leading-[0.85] uppercase tracking-tighter italic mb-8 md:mb-10 relative z-10">
              Join Our <br />
              <span className="text-orange-500">Global Team</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 md:mb-12 font-medium relative z-10 text-sm md:text-base">
              We are always looking for passionate individuals to help us redefine the future of logistics. 
              Explore our open positions and start your journey with SwiftShip Logistics.
            </p>
            <button className="bg-white text-[#001f3f] px-10 md:px-12 py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl relative z-10">
              View Careers
            </button>
          </section>
        </div>
      </main>

      <footer className="bg-[#001f3f] text-white py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-orange-500 p-2 rounded-xl">
              <Zap className="w-6 h-6 text-[#001f3f]" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">SwiftShip<span className="text-orange-500">Logistics</span></span>
          </div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest">© 2026 SwiftShip Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
