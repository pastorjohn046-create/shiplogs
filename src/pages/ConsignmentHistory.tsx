import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Shipment, ShipmentHistory } from '../types';
import { History, ArrowLeft, Package, MapPin, Clock, ChevronRight, Activity, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface AggregatedHistory extends ShipmentHistory {
  shipmentId: string;
  trackingId: string;
  origin: string;
  destination: string;
}

export default function ConsignmentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [historyFeed, setHistoryFeed] = useState<AggregatedHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/shipments?email=${user.email}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        
        const shipments: Shipment[] = Array.isArray(result) ? result : [];
        
        // Aggregate and sort history
        const aggregated: AggregatedHistory[] = [];
        shipments.forEach(s => {
          (s.history || []).forEach(h => {
            aggregated.push({
              ...h,
              shipmentId: s.id,
              trackingId: s.trackingId,
              origin: s.origin,
              destination: s.destination
            });
          });
        });

        // Sort by timestamp descending
        aggregated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistoryFeed(aggregated);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32 md:pb-10">
      <nav className="bg-[#001f3f] text-white px-6 md:px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Nexus <span className="text-orange-500">Manifest</span></h1>
        </div>
        <div className="bg-orange-500 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg rotate-2">
          <Activity className="w-4 h-4 text-white animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-6 md:p-10">
        <header className="mb-12">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-orange-500 mb-4 text-center md:text-left">Operational Intelligence</h2>
          <h3 className="text-4xl md:text-5xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic mb-6 text-center md:text-left">
            Change <br />
            <span className="text-gray-300">Manifest</span>
          </h3>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xl text-center md:text-left">
            Review every transition in your logistics chain. From warehouse ingress to final carrier handoff, track the pulse of your cargo.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Synchronizing Logs...</p>
          </div>
        ) : historyFeed.length > 0 ? (
          <div className="space-y-8 relative">
            <div className="absolute left-[39px] md:left-[47px] top-4 bottom-4 w-1 bg-gray-100 rounded-full" />
            
            {historyFeed.map((update, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex items-start gap-6 md:gap-10 group"
              >
                <div className="z-10 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl border border-gray-50 group-hover:bg-orange-500 transition-all duration-500 rotate-3">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[#001f3f] group-hover:text-white transition-colors" />
                </div>
                
                <div 
                  onClick={() => navigate(`/track/${update.trackingId}`)}
                  className="flex-1 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 hover:border-orange-500/30 transition-all cursor-pointer group/card"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{update.status}</span>
                        <span className="text-[8px] font-black text-gray-300">•</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(update.timestamp), 'MMM dd | HH:mm')}</span>
                      </div>
                      <h4 className="text-xl font-black text-[#001f3f] uppercase tracking-tighter italic">Track ID: {update.trackingId}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{update.location}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                    {update.description || `Shipment successfully transitioned to ${update.status} state.`}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-6">
                      <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        Origin <br />
                        <span className="text-gray-600 text-[10px]">{update.origin}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200" />
                      <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        Target <br />
                        <span className="text-gray-600 text-[10px]">{update.destination}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-500 opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-12 text-center shadow-xl border border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
              <History className="w-12 h-12 text-gray-300" />
            </div>
            <h4 className="text-2xl font-black text-[#001f3f] uppercase tracking-tight italic mb-4">No Recent Changes</h4>
            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm leading-relaxed mb-8">
              Your logbook is currently empty. Once your shipments begin their journey, updates will appear here in real-time.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#001f3f] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all shadow-xl"
            >
              Start Tracking
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
