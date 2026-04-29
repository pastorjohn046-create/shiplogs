import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Ship, Truck, ArrowLeft, Globe, Zap, ShieldCheck, Clock, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  {
    title: 'Air Freight',
    description: 'Express delivery across continents with our dedicated air fleet. We offer priority handling and real-time tracking for your most urgent shipments.',
    icon: Plane,
    color: 'bg-blue-500',
    features: ['Next-day delivery', 'Global coverage', 'Temperature control', 'Hazardous materials']
  },
  {
    title: 'Ocean Cargo',
    description: 'Cost-effective global shipping for large-scale logistics. Our ocean freight services provide reliable transit times and flexible scheduling.',
    icon: Ship,
    color: 'bg-indigo-500',
    features: ['Full container load', 'Less than container load', 'Port-to-port', 'Customs brokerage']
  },
  {
    title: 'Land Transport',
    description: 'Reliable door-to-door delivery with real-time route optimization. Our trucking network ensures safe and timely arrival for regional shipments.',
    icon: Truck,
    color: 'bg-orange-500',
    features: ['Last-mile delivery', 'Refrigerated trucks', 'Heavy haulage', 'Route optimization']
  },
];

export default function Services() {
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
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Our Expertise</h2>
            <h1 className="text-4xl md:text-8xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic mb-6 md:mb-8">
              Logistics <br />
              <span className="text-gray-300">Without Limits</span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
              We provide a comprehensive suite of logistics solutions designed to meet the demands of modern commerce. 
              From express air freight to massive ocean cargo, we move the world.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 md:gap-12">
            {services.map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-8 md:gap-12 items-center"
              >
                <div className={`${service.color} w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shrink-0 rotate-3`}>
                  <service.icon className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl md:text-4xl font-black text-[#001f3f] mb-4 md:mb-6 uppercase tracking-tight italic">{service.title}</h2>
                  <p className="text-sm md:text-lg text-gray-500 leading-relaxed mb-6 md:mb-8 font-medium">
                    {service.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {service.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#001f3f]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Value Section */}
          <section className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center p-8 md:p-10 bg-[#001f3f] text-white rounded-[2rem] md:rounded-[3rem] shadow-2xl">
              <div className="bg-orange-500 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4 uppercase tracking-tight italic">Speed</h3>
              <p className="text-gray-400 font-medium text-sm leading-relaxed">
                Our automated routing system finds the fastest path for your shipment in milliseconds.
              </p>
            </div>
            <div className="text-center p-8 md:p-10 bg-white text-[#001f3f] rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100">
              <div className="bg-blue-500 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
                <Globe className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4 uppercase tracking-tight italic">Reach</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                With strategic hubs in over 180 countries, we provide truly global coverage.
              </p>
            </div>
            <div className="text-center p-8 md:p-10 bg-white text-[#001f3f] rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100">
              <div className="bg-indigo-500 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-4 uppercase tracking-tight italic">Reliability</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                99.9% success rate backed by end-to-end security and real-time monitoring.
              </p>
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
