import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Search, Clock, MapPin, ArrowRight, ArrowLeft, Globe, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../services/dataService';
import { Shipment } from '../types';

export default function Flights() {
  const [flights, setFlights] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const allShipments = await dataService.getShipments();
        const activeFlights = allShipments.filter(s => s.type === 'Flight');
        setFlights(activeFlights);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const filteredFlights = flights.filter(f => 
    f.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.flightNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-0">
      {/* Dynamic Navigation */}
      <nav className="nexus-glass px-4 md:px-6 py-4 md:py-6 sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#001f3f]" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-black uppercase tracking-tighter italic text-[#001f3f]">Flight <span className="text-orange-600">Ops</span></h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Global Air Network</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors">Schedule</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-orange-600 transition-colors">Routes</button>
            <button className="bg-orange-600 px-6 py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Direct Uplink</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Search & Header */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="text-orange-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Strategic Air Logistics</div>
              <h2 className="text-5xl md:text-7xl font-black text-[#001f3f] leading-[0.9] uppercase tracking-tighter italic">
                Active Flight <br />
                <span className="text-slate-300">Monitors.</span>
              </h2>
            </div>
            <div className="relative group w-full md:w-[400px]">
              <div className="absolute -inset-2 bg-orange-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex items-center">
                <Search className="w-5 h-5 text-slate-300 ml-4 mr-3" />
                <input 
                  type="text" 
                  placeholder="SEARCH FLIGHT OR ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-black uppercase tracking-tight text-[#001f3f] placeholder:text-slate-300 py-3 px-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="nexus-card p-10 h-[300px] animate-pulse bg-slate-100" />
                ))
              ) : filteredFlights.length > 0 ? (
                filteredFlights.map((flight, i) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/track/${flight.trackingId}`)}
                    className="nexus-card group cursor-pointer overflow-hidden relative"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="bg-[#001f3f] p-3 rounded-2xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Plane className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Status</span>
                          <span className={`${flight.status === 'Delivered' ? 'text-green-500' : 'text-orange-500'} text-[10px] font-black uppercase tracking-widest italic`}>
                            {flight.status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-10">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tracking Terminal</span>
                        <div className="text-2xl font-black text-[#001f3f] tracking-tighter italic uppercase group-hover:text-orange-600 transition-colors">
                          {flight.trackingId}
                        </div>
                        {flight.flightNumber && (
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Flight: {flight.flightNumber}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 relative">
                        <div className="flex flex-col flex-1">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</span>
                          <span className="text-sm font-black text-[#001f3f] uppercase tracking-tight italic truncate">{flight.origin}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div className="flex flex-col flex-1 text-right">
                          <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</span>
                          <span className="text-sm font-black text-[#001f3f] uppercase tracking-tight italic truncate">{flight.destination}</span>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            ETA: {flight.arrivalTime || 'Pending'}
                          </span>
                        </div>
                        <button className="bg-slate-50 p-2 md:p-3 rounded-xl group-hover:bg-[#001f3f] group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Background Visual */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap className="w-32 h-32 text-orange-600 -mr-16 -mt-16 rotate-12" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center">
                   <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[3.5rem] border border-slate-100 max-w-xl mx-auto shadow-xl">
                      <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-8 animate-bounce" />
                      <h4 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-4">No Air Traffic Detected</h4>
                      <p className="text-slate-500 font-medium leading-relaxed mb-10 italic">
                        No active flights matching your parameters were found in the current global manifest.
                      </p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="bg-[#001f3f] text-white px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-orange-600 transition-all active:scale-95"
                      >
                         Reset Manifest Scan
                      </button>
                   </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Hub Map Section (Abstract) */}
        <section className="mt-20">
           <div className="nexus-gradient p-12 md:p-24 rounded-[3.5rem] md:rounded-[5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109c0f?auto=format&fit=crop&q=80')] bg-cover opacity-10 group-hover:scale-110 transition-transform duration-[10000ms]" />
              <div className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm" />
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                <div className="max-w-xl">
                  <div className="bg-orange-600 p-4 rounded-2xl w-fit mb-10 shadow-2xl">
                    <Globe className="w-8 h-8 text-white animate-spin-slow" />
                  </div>
                  <h3 className="text-4xl md:text-6xl font-black text-white leading-[0.9] uppercase tracking-tighter italic mb-10">
                    Proprietary <br />
                    <span className="text-orange-500">Air Network.</span>
                  </h3>
                  <p className="text-white/60 text-lg font-medium leading-relaxed italic mb-12">
                    Peak Logistics Partners operates a private fleet of 14 Boeing 777-200F strategic freighters, 
                    connected to a grid of over 40 global hubs for 24-hour delivery protocols.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {['24/7 Monitoring', 'Elite Cargo Protection', 'Direct Hub Injection'].map(tag => (
                      <div key={tag} className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white/50">{tag}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { hub: 'London Heathrow HUB A', status: 'Optimal', delay: '0ms' },
                    { hub: 'Dubai Int HUB VII', status: 'Operational', delay: '+12ms' },
                    { hub: 'HKG Intermodal IV', status: 'Optimal', delay: '2ms' },
                    { hub: 'Schiphol Gate IX', status: 'Operational', delay: '5ms' },
                  ].map((hub, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group/hub">
                      <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white font-black italic uppercase tracking-tighter group-hover/hub:text-orange-500 transition-colors">{hub.hub}</span>
                      </div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{hub.delay}</div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
