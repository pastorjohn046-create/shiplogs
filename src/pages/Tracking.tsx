import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Shipment, ShipmentStatus } from '../types';
import { Truck, Package, MapPin, CheckCircle2, Clock, Image as ImageIcon, ArrowLeft, Download, Plane, Plus, AlertCircle, Zap, ArrowRight, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const STATUS_STEPS: ShipmentStatus[] = [
  'Pending', 
  'Warehouse', 
  'Customs', 
  'Carrier 1', 
  'Carrier 2', 
  'Shipped', 
  'Delivered'
];

export default function Tracking() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchShipment = async () => {
    if (!trackingId) return;
    try {
      const response = await fetch(`/api/shipments/${trackingId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setShipment(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Fetch error:', response.status, errData);
        setShipment(null);
      }
    } catch (error) {
      console.error('Failed to fetch shipment:', error);
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchShipment, 30000);
    return () => clearInterval(interval);
  }, [trackingId]);

  const handleClaim = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/track/${trackingId}` } });
      return;
    }

    setIsClaiming(true);
    setClaimError('');
    setClaimSuccess(false);

    try {
      const response = await fetch('/api/shipments/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setClaimSuccess(true);
        fetchShipment();
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

  const generateReceipt = () => {
    if (!shipment) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('SwiftShip Logistics Shipping Receipt', 20, 20);
    doc.setFontSize(12);
    doc.text(`Tracking ID: ${shipment.trackingId}`, 20, 35);
    doc.text(`Status: ${shipment.status}`, 20, 45);
    doc.text(`Origin: ${shipment.origin}`, 20, 55);
    doc.text(`Destination: ${shipment.destination}`, 20, 65);
    doc.text(`Customer: ${shipment.customerEmail}`, 20, 75);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 20, 85);
    doc.save(`Receipt-${shipment.trackingId}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#001f3f]"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full">
          <div className="bg-red-50 p-4 rounded-full w-fit mx-auto mb-6">
            <Package className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#001f3f] mb-4 uppercase tracking-tight italic">Shipment Not Found</h1>
          <p className="text-gray-500 mb-8 font-medium">We couldn't find any shipment with Tracking ID: <span className="font-mono font-bold text-[#001f3f]">{trackingId}</span></p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(shipment.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-20 font-sans">
      {/* Header */}
      <nav className="nexus-glass px-3 md:px-6 py-4 md:py-6 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/')} className="p-2 md:p-3 hover:bg-slate-100 rounded-2xl transition-colors">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-[#001f3f]" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl font-black uppercase tracking-tighter italic text-[#001f3f]">SwiftShip <span className="text-orange-600 hidden sm:inline">Logistics</span><span className="text-orange-600 sm:hidden">Lg.</span></h1>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {shipment && user && shipment.userId === user.uid ? (
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 text-[#001f3f] px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-slate-200">
              <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 text-orange-600" />
              Verified
            </div>
          ) : (
            <button 
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex items-center gap-1.5 md:gap-2 bg-[#001f3f] text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-orange-600 disabled:opacity-50 shadow-lg shadow-indigo-900/10"
            >
              {isClaiming ? 'Wait...' : (
                <>
                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  Claim
                </>
              )}
            </button>
          )}
          <button 
            onClick={generateReceipt}
            className="flex items-center gap-1.5 md:gap-2 bg-orange-600 text-white px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            Receipt
          </button>
        </div>
      </nav>

      {claimError && (
        <div className="max-w-5xl mx-auto px-4 md:px-6 mt-4 md:mt-6">
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] flex items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
            Error: {claimError}
          </div>
        </div>
      )}

      {claimSuccess && (
        <div className="max-w-5xl mx-auto px-4 md:px-6 mt-4 md:mt-6">
          <div className="bg-green-50 border border-green-100 text-green-600 px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] flex items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest italic">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            Success: Asset synced.
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 md:px-6 mt-8 md:mt-12 pb-32">
        {/* Tracking ID Card: Tactical Overview */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 md:p-14 mb-8 md:mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-12 relative z-10">
            <div className="flex items-center gap-5 md:gap-8 w-full sm:w-auto">
              <div className={`p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl ${shipment.type === 'Flight' ? 'bg-[#001f3f] text-white' : 'bg-orange-600 text-white'}`}>
                {shipment.type === 'Flight' ? <Plane className="w-8 h-8 md:w-12 md:h-12" /> : <Truck className="w-8 h-8 md:w-12 md:h-12" />}
              </div>
              <div className="min-w-0">
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-2 md:mb-4 block">Deployment ID ({shipment.type})</span>
                <h2 className="text-2xl md:text-6xl font-black text-[#001f3f] tracking-tighter italic uppercase truncate">{shipment.trackingId}</h2>
              </div>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3 bg-slate-50 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl md:rounded-3xl border border-slate-100 w-full sm:min-w-[240px] justify-center">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[#001f3f] font-black uppercase text-xs md:text-sm tracking-widest italic">{shipment.status}</span>
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 sm:px-8 text-center sm:text-right w-full sm:w-auto">Last: {shipment.history?.[shipment.history.length-1]?.location || 'SwiftShip HQ'}</span>
            </div>
          </div>

          {/* Progress Timeline: Industrial visualization */}
          <div className="mt-12 md:mt-24 relative px-0 md:px-8">
            <div className="hidden md:block">
              <div className="absolute top-1/2 left-0 w-full h-2 bg-slate-50 -translate-y-1/2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-600 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                  style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
              
              <div className="relative flex justify-between items-center text-center">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step} className="flex flex-col items-center group">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center z-10 transition-all duration-500 ${
                        isCompleted ? 'bg-[#001f3f] text-white scale-110 shadow-2xl rotate-3 border-2 border-orange-600/20' : 'bg-white text-slate-200 border-2 border-slate-100'
                      }`}>
                        {isCompleted ? <Zap className="w-8 h-8 text-orange-500" /> : <div className="w-4 h-4 bg-slate-100 rounded-full" />}
                      </div>
                      <div className={`mt-8 text-[11px] font-black uppercase tracking-[0.2em] max-w-[100px] transition-colors duration-500 ${
                        isCurrent ? 'text-orange-600' : isCompleted ? 'text-[#001f3f]' : 'text-slate-300'
                      }`}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Adaptive Stepper */}
            <div className="md:hidden">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-[#001f3f] p-3 rounded-xl">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Phase</span>
                    <span className="text-base font-black text-[#001f3f] uppercase italic">{currentStepIndex + 1} / {STATUS_STEPS.length}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-600 transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Shipment Info: History Timeline */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 p-6 md:p-14">
              <h3 className="text-xl md:text-2xl font-black text-[#001f3f] mb-8 md:mb-12 flex items-center gap-3 md:gap-4 uppercase tracking-tight italic">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                Transit Ops History
              </h3>
              
              <div className="space-y-10 md:space-y-14 relative before:absolute before:left-[15px] md:before:left-[19px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-50">
                {shipment.history?.length > 0 ? (
                  shipment.history.map((event, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-10 md:pl-14"
                    >
                      <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 bg-white border-4 border-orange-600 rounded-xl md:rounded-2xl z-10 shadow-xl rotate-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-600 rounded-full animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-3 md:gap-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 md:gap-4">
                          <div>
                            <h4 className="font-black text-[#001f3f] text-lg md:text-2xl uppercase tracking-tighter italic">{event.status}</h4>
                            <div className="flex items-center gap-1.5 text-orange-600/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
                              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              {event.location}
                            </div>
                          </div>
                          <span className="text-[7px] md:text-[9px] font-black text-slate-400 bg-slate-50 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl uppercase tracking-widest border border-slate-100">
                            {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4 md:pl-6 text-xs md:text-base">{event.description}</p>
                        
                        {event.photoUrl && (
                          <div className="mt-4 md:mt-8 rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl group cursor-pointer relative aspect-video">
                            <img 
                              src={event.photoUrl} 
                              alt="Tactical Asset Proof" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f]/80 to-transparent flex items-end p-4 md:p-8">
                              <div className="flex items-center gap-3 md:gap-4 text-white">
                                <div className="bg-orange-600 p-2 md:p-2.5 rounded-lg md:rounded-xl">
                                  <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60">Verified Asset Scan</div>
                                  <div className="text-[10px] md:text-xs font-black uppercase tracking-tighter truncate">Physical Integrity Confirmed</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )).reverse()
                ) : (
                  <div className="text-center py-20 text-slate-300 font-black uppercase tracking-[0.5em] text-[10px] md:text-xs italic">
                    Initializing Data Streams...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Route & Support Intelligence */}
          <div className="space-y-8 md:space-y-12">
            <div className="bg-[#001f3f] text-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
              
              <h3 className="text-xl md:text-2xl font-black mb-8 md:mb-12 flex items-center gap-3 md:gap-4 uppercase tracking-tight italic">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                Route Intel
              </h3>
              
              <div className="space-y-10 md:space-y-14 relative before:absolute before:left-[15px] md:before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                <div className="relative pl-10 md:pl-14">
                  <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 bg-[#001f3f] border-4 border-orange-600 rounded-xl md:rounded-2xl z-10 rotate-3 shadow-2xl flex items-center justify-center">
                    <span className="text-[8px] md:text-[10px] font-black text-orange-500">ORG</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-[0.2em] md:tracking-[0.3em] block mb-2 md:mb-3">Origin Hub</span>
                  <p className="font-black text-lg md:text-2xl leading-none tracking-tighter italic uppercase truncate">{shipment.origin}</p>
                </div>
                <div className="relative pl-10 md:pl-14">
                  <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 bg-[#001f3f] border-4 border-green-500 rounded-xl md:rounded-2xl z-10 -rotate-3 shadow-2xl flex items-center justify-center">
                    <span className="text-[8px] md:text-[10px] font-black text-green-500">DST</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-white/30 tracking-[0.2em] md:tracking-[0.3em] block mb-2 md:mb-3">Target Destination</span>
                  <p className="font-black text-lg md:text-2xl leading-none tracking-tighter italic uppercase truncate">{shipment.destination}</p>
                </div>
              </div>

              <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-white/10 space-y-4 md:space-y-6 text-[8px] md:text-[10px]">
                <div className="flex justify-between items-center font-black uppercase tracking-widest text-white/40">
                  <span>Transport Protocol</span>
                  <span className="text-white">{shipment.type} Standard</span>
                </div>
                <div className="flex justify-between items-center font-black uppercase tracking-widest text-white/40">
                  <span>Unit Mass</span>
                  <span className="text-white">{shipment.weight || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="nexus-card p-8 md:p-12 border-slate-200">
              <h3 className="text-xl md:text-2xl font-black text-[#001f3f] mb-4 md:mb-6 uppercase tracking-tight italic">Support Uplink</h3>
              <p className="text-slate-400 font-medium text-xs md:text-sm mb-8 md:mb-10 leading-relaxed italic">
                SwiftShip tactical support is active 24/7. Connect for real-time asset inquiries via our direct command grid.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/support')}
                  className="w-full bg-[#001f3f] text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-orange-600 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg group"
                >
                  Ticket Terminal <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="https://t.me/PeakLogisticsPartners"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0088cc] text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-[#0077b5] transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg group"
                >
                  Direct Telegram <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
