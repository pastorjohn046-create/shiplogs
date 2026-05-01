import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Shipment } from '../types';
import { Package, Truck, Plane, ChevronRight, User, Mail, LogOut, Plus, Search, CheckCircle2, AlertCircle, History, Globe, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';

import { dataService } from '../services/dataService';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimTrackingId, setClaimTrackingId] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchShipments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dataService.getShipments();
      setShipments(data);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [user]);

  const handleClaimShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = claimTrackingId.trim();
    if (!tid) return;

    setIsClaiming(true);
    setClaimError('');
    setClaimSuccess(false);

    try {
      const shipment = await dataService.getShipmentByTrackingId(tid);
      if (!shipment) throw new Error('Shipment not found');
      if (shipment.userId === user.uid) throw new Error('Already in your console');
      
      await dataService.updateShipment(shipment.id, { userId: user.uid });
      
      setClaimSuccess(true);
      setClaimTrackingId('');
      fetchShipments();
      setTimeout(() => setClaimSuccess(false), 5000);
    } catch (error: any) {
      setClaimError(error.message || 'Failed to claim shipment');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-32 pb-20 md:pb-40 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Console Header */}
        <div className="mb-12 md:mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-8 md:gap-10">
          <div>
            <div className="text-orange-600 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[8px] md:text-[10px] mb-4 md:mb-6">Operations Terminal</div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-[#001f3f] uppercase tracking-tighter italic leading-[0.9] md:leading-none">
              Peak <span className="text-slate-300 block sm:inline">Console.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-6 md:mt-8">
              <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-50 rounded-full border border-slate-100">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#001f3f]">System Optimal</span>
              </div>
              <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Node: {user.uid?.slice(0, 8)}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 bg-slate-50 text-[#001f3f] px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-slate-100 transition-all border border-slate-200"
            >
              <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Manifest
            </button>
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 bg-[#001f3f] text-white px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-orange-600 transition-all"
              >
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                Admin HQ
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 bg-red-50 text-red-600 px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-red-100 transition-all border border-red-100"
            >
              <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Exit
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Identity Column */}
          <div className="lg:col-span-1 space-y-8 md:space-y-12">
            <div className="nexus-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden border-slate-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="flex items-center gap-6 md:gap-8 mb-8 md:mb-12">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#001f3f] rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-white text-2xl md:text-4xl font-black italic shadow-2xl rotate-3 border-4 border-white">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-[#001f3f] uppercase tracking-tighter italic">Operator.</h2>
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mt-1 md:mt-2">Active Protocol</p>
                </div>
              </div>

              <div className="space-y-6 md:space-y-10">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-1 block mb-3 md:mb-4 italic">Identity Hash</label>
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 flex items-center gap-4 md:gap-5">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                    <span className="text-xs md:text-sm font-black text-[#001f3f] truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 md:mt-16 pt-8 md:pt-12 border-t border-slate-50 grid grid-cols-2 gap-4 md:gap-8">
                <div className="text-center p-4 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100">
                  <div className="text-2xl md:text-4xl font-black text-[#001f3f] italic">{Array.isArray(shipments) ? shipments.length : 0}</div>
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-300 mt-2 md:mt-3">Assets</div>
                </div>
                <div className="text-center p-4 md:p-8 bg-orange-50 rounded-2xl md:rounded-[2.5rem] border border-orange-100">
                  <div className="text-2xl md:text-4xl font-black text-orange-600 italic">
                    {Array.isArray(shipments) ? shipments.filter(s => s.status !== 'Delivered').length : 0}
                  </div>
                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-400 mt-2 md:mt-3">Live</div>
                </div>
              </div>

              {/* Tactical Claim Control */}
              <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-slate-50">
                <h3 className="text-[10px] md:text-[11px] font-black text-[#001f3f] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-8 italic">Asset Initialization</h3>
                <form onSubmit={handleClaimShipment} className="space-y-4 md:space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 group-focus-within:text-orange-600 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Tactical ID..."
                      value={claimTrackingId}
                      onChange={(e) => setClaimTrackingId(e.target.value)}
                      className="w-full pl-12 md:pl-16 pr-5 md:pr-6 py-4 md:py-6 bg-slate-50 rounded-2xl md:rounded-3xl outline-none focus:ring-4 ring-orange-600/10 font-black text-xs md:text-sm uppercase tracking-widest border border-transparent focus:border-orange-600/20 transition-all placeholder:text-slate-200"
                    />
                  </div>
                  <button 
                    disabled={isClaiming}
                    className="w-full bg-[#001f3f] text-white py-4 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 md:gap-4 group"
                  >
                    {isClaiming ? 'Accessing Grid...' : 'Map Token To Secure Console'}
                    <Plus className="w-4 h-4 md:w-5 md:h-5 text-orange-500 group-hover:rotate-180 transition-transform" />
                  </button>
                  {claimError && (
                    <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" />
                      {claimError}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Operations View Column */}
          <div className="lg:col-span-2">
            <div className="nexus-card rounded-[2rem] md:rounded-[3.5rem] border-slate-200 overflow-hidden bg-slate-50/30">
              <div className="p-6 md:p-10 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <h3 className="text-xl md:text-2xl font-black text-[#001f3f] uppercase tracking-tighter italic">Live Operations.</h3>
                <Link to="/" className="text-[8px] md:text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest underline decoration-2 underline-offset-4 md:underline-offset-8">Track New</Link>
              </div>

              {loading ? (
                <div className="p-16 md:p-32 text-center">
                  <div className="animate-spin w-12 h-12 md:w-16 md:h-16 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-8 md:mb-10"></div>
                  <div className="text-slate-300 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-xs text-center">Synchronizing Manifest...</div>
                </div>
              ) : (Array.isArray(shipments) && shipments.length === 0) ? (
                <div className="p-12 md:p-32 text-center">
                  <div className="bg-white w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 md:mb-12 shadow-2xl shadow-slate-200">
                    <Package className="w-10 h-10 md:w-16 md:h-16 text-slate-100" />
                  </div>
                  <h4 className="text-2xl md:text-4xl font-black text-[#001f3f] mb-4 md:mb-6 uppercase tracking-tighter italic">Console Empty.</h4>
                  <p className="text-slate-400 font-medium mb-8 md:mb-12 max-w-sm mx-auto leading-relaxed italic text-xs md:text-base px-4">Your secure console has no active asset mappings. Initialize a tracking token to begin operations.</p>
                  <Link to="/" className="inline-flex items-center gap-4 bg-[#001f3f] text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-600 transition-all shadow-2xl">
                    Query Public Grid
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {Array.isArray(shipments) && shipments.map((shipment, i) => (
                    <motion.div
                      key={shipment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 md:p-10 hover:bg-white transition-all group cursor-pointer relative"
                      onClick={() => navigate(`/track/${shipment.trackingId}`)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 md:gap-8">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 min-w-0">
                          <div className={`w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-2xl md:rounded-[2rem] shadow-xl transition-all group-hover:scale-105 group-hover:rotate-3 flex-shrink-0 ${shipment.type === 'Flight' ? 'bg-[#001f3f] text-white' : 'bg-orange-600 text-white'}`}>
                            {shipment.type === 'Flight' ? <Plane className="w-6 h-6 md:w-10 md:h-10" /> : <Truck className="w-6 h-6 md:w-10 md:h-10" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2 md:mb-4">
                              <span className="font-black text-xl md:text-3xl text-[#001f3f] tracking-tighter italic uppercase truncate">{shipment.trackingId}</span>
                              <div className={`flex items-center gap-2 px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                shipment.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-100' :
                                shipment.status === 'In Transit' ? 'bg-indigo-50 text-[#001f3f] border border-indigo-100' :
                                'bg-orange-50 text-orange-700 border border-orange-100'
                              }`}>
                                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${shipment.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                                {shipment.status}
                              </div>
                            </div>
                            <div className="text-[9px] md:text-[11px] text-slate-400 flex items-center gap-2 md:gap-3 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                              <span className="truncate">{shipment.origin}</span>
                              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-orange-600 flex-shrink-0" />
                              <span className="truncate text-[#001f3f] font-black">{shipment.destination}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                          <div className="text-left sm:text-right">
                            <div className="text-base md:text-lg font-black text-[#001f3f] italic leading-none">
                              {format(new Date(shipment.updatedAt), 'MMM dd')}
                            </div>
                            <div className="text-[8px] md:text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1 md:mt-2">Log Sync</div>
                          </div>
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-[#001f3f] group-hover:text-white group-hover:rotate-45 transition-all shadow-sm">
                            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Tactical Support Grid Link */}
            <div className="mt-8 md:mt-16 bg-[#001f3f] rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 text-white flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-12 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,31,63,0.4)]">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_70%)]" />
              <div className="relative z-10 text-center xl:text-left">
                <div className="text-orange-500 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[8px] md:text-[10px] mb-4 md:mb-6">24/7 Command Support</div>
                <h3 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter italic leading-none">Complex <br /> <span className="text-slate-500">Inquiry?</span></h3>
                <p className="text-slate-400 font-medium max-w-sm text-base md:text-lg leading-relaxed italic mx-auto xl:mx-0">Connect directly to Peak Tactical HQ for real-time problem resolution.</p>
              </div>
              <Link to="/support" className="w-full xl:w-auto relative z-10 bg-orange-600 text-white px-8 md:px-16 py-5 md:py-8 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-500 transition-all shadow-2xl shadow-orange-600/30 whitespace-nowrap text-center">
                Secure Uplink Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
