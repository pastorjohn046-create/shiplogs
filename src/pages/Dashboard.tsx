import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Shipment } from '../types';
import { Package, Truck, Plane, ChevronRight, User, Mail, LogOut, Plus, Search, CheckCircle2, AlertCircle, History, Globe, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';

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
      const res = await fetch('/api/shipments', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setShipments(data);
      } else {
        console.error('Expected array of shipments, got:', data);
        setShipments([]);
      }
    } catch (err) {
      console.error('Detailed error fetching shipments:', err);
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
    if (!claimTrackingId.trim()) return;

    setIsClaiming(true);
    setClaimError('');
    setClaimSuccess(false);

    try {
      const response = await fetch('/api/shipments/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: claimTrackingId.trim() }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setClaimSuccess(true);
        setClaimTrackingId('');
        fetchShipments();
        setTimeout(() => setClaimSuccess(false), 5000);
      } else {
        setClaimError(data.error || 'Failed to claim shipment');
      }
    } catch (error) {
      setClaimError('Network error. Please try again.');
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
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 pb-24 md:pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#001f3f] uppercase tracking-tighter italic">
              Nexus <span className="text-orange-500">Console</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your profile and track active shipments</p>
          </div>
          <div className="flex flex-row items-center gap-3 md:gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#001f3f] px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
            >
              <User className="w-3 h-3 md:w-4 md:h-4" />
              Profile
            </button>
            {user.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#001f3f] text-white px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-500 transition-all shadow-lg"
              >
                Admin
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-red-500 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border border-red-100 hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          {/* Profile Column second on mobile */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-8 sticky top-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
              
              <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#001f3f] rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-2xl md:text-3xl font-black italic shadow-2xl rotate-3">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-[#001f3f] uppercase tracking-tight italic">Member</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Account</p>
                </div>
              </div>

              <div className="space-y-6">
                <Link to="/profile" className="block group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 cursor-pointer">Email Address</label>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:border-orange-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-bold text-[#001f3f]">{user.email}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-orange-500 transition-colors" />
                  </div>
                </Link>
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Account ID</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:border-orange-500/20 transition-all">
                    <User className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-[#001f3f]">{user.uid?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-5 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="text-3xl font-black text-[#001f3f] italic">{Array.isArray(shipments) ? shipments.length : 0}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Total</div>
                  </div>
                  <div className="text-center p-5 bg-orange-50 rounded-3xl border border-orange-100">
                    <div className="text-3xl font-black text-orange-600 italic">
                      {Array.isArray(shipments) ? shipments.filter(s => s.status !== 'Delivered').length : 0}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-orange-400 mt-1">Active</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-50 space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Quick Actions</h3>
                <Link to="/updates" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-[#001f3f] hover:text-white transition-all group">
                  <div className="flex items-center gap-4">
                    <History className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold uppercase tracking-tight">Consignment Updates</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                </Link>
                <Link to="/news" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-[#001f3f] hover:text-white transition-all group">
                  <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold uppercase tracking-tight">Global Dispatch</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
                </Link>
              </div>

              {/* Claim Shipment Form */}
              <div className="mt-10 pt-8 border-t border-gray-50">
                <h3 className="text-sm font-black text-[#001f3f] uppercase tracking-widest mb-4 italic">Claim Shipment</h3>
                <form onSubmit={handleClaimShipment} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Enter Tracking ID"
                      value={claimTrackingId}
                      onChange={(e) => setClaimTrackingId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-bold text-sm uppercase tracking-tight"
                    />
                  </div>
                  <button 
                    disabled={isClaiming}
                    className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Shipment'}
                    {!isClaiming && <Plus className="w-4 h-4" />}
                  </button>
                  {claimError && (
                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      {claimError}
                    </div>
                  )}
                  {claimSuccess && (
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Shipment claimed successfully!
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Action/Shipments Column first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg md:text-xl font-black text-[#001f3f] uppercase tracking-tight italic">Recent Shipments</h3>
                <Link to="/" className="text-[10px] md:text-xs font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest">Track New</Link>
              </div>

              {loading ? (
                <div className="p-20 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing your cargo...</p>
                </div>
              ) : (Array.isArray(shipments) && shipments.length === 0) ? (
                <div className="p-20 text-center">
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Package className="w-12 h-12 text-gray-200" />
                  </div>
                  <h4 className="text-2xl font-black text-[#001f3f] mb-2 uppercase tracking-tight italic">No shipments found</h4>
                  <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto">You haven't assigned any shipments to this account yet.</p>
                  <Link to="/" className="inline-flex items-center gap-3 bg-[#001f3f] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl">
                    Track by ID
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {Array.isArray(shipments) && shipments.map((shipment) => (
                    <motion.div
                      key={shipment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 md:p-8 hover:bg-gray-50 transition-all group"
                    >
                      <Link to={`/track/${shipment.trackingId}`} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 md:gap-6 min-w-0">
                          <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm transition-all group-hover:scale-110 flex-shrink-0 ${shipment.type === 'Flight' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {shipment.type === 'Flight' ? <Plane className="w-6 h-6 md:w-8 md:h-8" /> : <Truck className="w-6 h-6 md:w-8 md:h-8" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                              <span className="font-black text-base md:text-xl text-[#001f3f] tracking-tight italic truncate">{shipment.trackingId}</span>
                              <span className={`text-[8px] md:text-[9px] uppercase font-black px-2 md:px-3 py-0.5 md:py-1 rounded-full tracking-widest whitespace-nowrap ${
                                shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {shipment.status}
                              </span>
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 md:gap-2 font-bold uppercase tracking-widest truncate">
                              <span className="truncate">{shipment.origin}</span>
                              <ChevronRight className="w-2 h-2 md:w-3 md:h-3 text-orange-500 flex-shrink-0" />
                              <span className="truncate">{shipment.destination}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                          <div className="text-right hidden md:block">
                            <div className="text-sm font-black text-[#001f3f] italic">
                              {format(new Date(shipment.updatedAt), 'MMM d, yyyy')}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last updated</div>
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Support Quick Link */}
            <div className="mt-8 md:mt-12 bg-orange-500 rounded-3xl md:rounded-[3rem] p-8 md:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
              <div className="relative z-10 text-center lg:text-left">
                <h3 className="text-3xl md:text-4xl font-black mb-3 md:mb-4 uppercase tracking-tighter italic">Need Help?</h3>
                <p className="text-orange-100 font-medium max-w-md text-sm md:text-base">Our elite support team is available 24/7 to assist with your global shipments.</p>
              </div>
              <Link to="/support" className="w-full md:w-auto relative z-10 bg-[#001f3f] text-white px-8 md:px-12 py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 transition-transform shadow-xl whitespace-nowrap text-center">
                Open Support Ticket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
