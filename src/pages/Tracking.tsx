import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Shipment, ShipmentStatus } from '../types';
import { Truck, Package, MapPin, CheckCircle2, Clock, Image as ImageIcon, ArrowLeft, Download, Plane, Plus, AlertCircle } from 'lucide-react';
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
    doc.text('Nexus Logistics Shipping Receipt', 20, 20);
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
      <nav className="bg-[#001f3f] text-white px-4 md:px-6 py-4 md:py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Nexus <span className="text-orange-500">Logistics</span></h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {shipment && user && shipment.userId === user.uid ? (
            <div className="hidden sm:flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/30">
              <CheckCircle2 className="w-3 h-3" />
              Claimed
            </div>
          ) : (
            <button 
              onClick={handleClaim}
              disabled={isClaiming}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 disabled:opacity-50"
            >
              {isClaiming ? '...' : (
                <>
                  <Plus className="w-3 h-3" />
                  Claim
                </>
              )}
            </button>
          )}
          <button 
            onClick={generateReceipt}
            className="flex items-center gap-2 bg-orange-500 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            Receipt
          </button>
        </div>
      </nav>

      {claimError && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <AlertCircle className="w-5 h-5" />
            {claimError}
          </div>
        </div>
      )}

      {claimSuccess && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-green-50 border border-green-100 text-green-600 px-6 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-5 h-5" />
            Shipment successfully added to your dashboard!
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
        {/* Tracking ID Card */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-10 mb-8 md:mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm ${shipment.type === 'Flight' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {shipment.type === 'Flight' ? <Plane className="w-8 h-8 md:w-10 md:h-10" /> : <Truck className="w-8 h-8 md:w-10 md:h-10" />}
              </div>
              <div>
                <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 md:mb-2 block">Tracking ID ({shipment.type})</span>
                <h2 className="text-2xl md:text-4xl font-black text-[#001f3f] tracking-tighter italic">{shipment.trackingId}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-green-50 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border border-green-100">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-black uppercase text-[10px] md:text-xs tracking-widest">{shipment.status}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 md:mt-16 relative px-2 md:px-4 mb-8 md:mb-0">
            {/* Desktop Horizontal Bar */}
            <div className="hidden md:block">
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full"></div>
              <div 
                className="absolute top-1/2 left-0 h-1.5 bg-orange-500 -translate-y-1/2 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
              ></div>
              
              <div className="relative flex justify-between items-center">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 ${
                        isCompleted ? 'bg-orange-500 text-white scale-110 shadow-xl rotate-3' : 'bg-white text-gray-300 border-2 border-gray-100'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <div className="w-3 h-3 bg-gray-200 rounded-full"></div>}
                      </div>
                      <span className={`mt-6 text-[9px] font-black uppercase tracking-widest text-center max-w-[80px] ${
                        isCurrent ? 'text-orange-500' : isCompleted ? 'text-[#001f3f]' : 'text-gray-300'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical/Compact Stepper */}
            <div className="md:hidden">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Current Status</span>
                      <h4 className="text-sm font-black text-[#001f3f] uppercase tracking-tight italic">{shipment.status}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      Step {currentStepIndex + 1} of {STATUS_STEPS.length}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 px-1">
                  {STATUS_STEPS.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        index <= currentStepIndex ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Shipment Info */}
          <div className="md:col-span-2 space-y-8 md:space-y-10">
            {/* History Timeline */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-gray-100 p-6 md:p-10">
              <h3 className="text-xl md:text-2xl font-black text-[#001f3f] mb-8 md:mb-10 flex items-center gap-3 uppercase tracking-tight italic">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
                Transit History
              </h3>
              
              <div className="space-y-10 md:space-y-12 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-gray-50">
                {shipment.history?.length > 0 ? (
                  shipment.history.map((event, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative pl-10 md:pl-12"
                    >
                      <div className="absolute left-0 top-1 w-7 h-7 md:w-8 md:h-8 bg-white border-4 border-orange-500 rounded-lg md:rounded-xl z-10 shadow-lg rotate-3"></div>
                      <div className="flex flex-col gap-2 md:gap-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <h4 className="font-black text-[#001f3f] text-lg md:text-xl uppercase tracking-tight italic">{event.status}</h4>
                          <span className="text-[8px] md:text-[10px] font-black text-gray-400 bg-gray-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-widest border border-gray-100">
                            {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] md:text-sm font-bold uppercase tracking-widest">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                          {event.location}
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed mt-1 text-sm md:text-base">{event.description}</p>
                        
                        {event.photoUrl && (
                          <div className="mt-4 md:mt-6 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 shadow-xl group cursor-pointer relative">
                            <img 
                              src={event.photoUrl} 
                              alt="Proof of Delivery" 
                              className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md p-3 md:p-4 flex items-center justify-between border-t border-gray-100">
                              <span className="text-[8px] md:text-[10px] font-black text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                                <ImageIcon className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                                Visual Proof
                              </span>
                              <button className="text-[8px] md:text-[10px] font-black text-orange-500 hover:underline uppercase tracking-widest">View Full Size</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )).reverse()
                ) : (
                  <div className="text-center py-12 md:py-16 text-gray-300 font-black uppercase tracking-widest text-[10px] md:text-xs italic">
                    No history recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8 md:space-y-10">
            <div className="bg-[#001f3f] text-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-tight italic">
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                Route Info
              </h3>
              
              <div className="space-y-8 md:space-y-10 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-white/5">
                <div className="relative pl-10 md:pl-12">
                  <div className="absolute left-0 top-1 w-7 h-7 md:w-8 md:h-8 bg-[#001f3f] border-4 border-orange-500 rounded-lg md:rounded-xl z-10 rotate-3 shadow-lg"></div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] block mb-1 md:mb-2">Origin</span>
                  <p className="font-black text-lg md:text-xl leading-tight tracking-tight italic">{shipment.origin}</p>
                </div>
                <div className="relative pl-10 md:pl-12">
                  <div className="absolute left-0 top-1 w-7 h-7 md:w-8 md:h-8 bg-[#001f3f] border-4 border-green-500 rounded-lg md:rounded-xl z-10 -rotate-3 shadow-lg"></div>
                  <span className="text-[8px] md:text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] block mb-1 md:mb-2">Destination</span>
                  <p className="font-black text-lg md:text-xl leading-tight tracking-tight italic">{shipment.destination}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10">
              <h3 className="text-xl font-black text-[#001f3f] mb-4 uppercase tracking-tight italic">Need Help?</h3>
              <p className="text-gray-400 font-medium text-sm mb-8 leading-relaxed">
                If you have any questions about your shipment, our elite support team is available 24/7.
              </p>
              <button 
                onClick={() => navigate('/support')}
                className="w-full bg-gray-50 text-[#001f3f] py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-gray-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
