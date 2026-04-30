import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shipment, ShipmentStatus, ShipmentHistory } from '../types';
import { Truck, Package, MapPin, Clock, ArrowLeft, Camera, Send, CheckCircle2, AlertCircle, Loader2, FileText, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

const STATUS_OPTIONS: ShipmentStatus[] = [
  'Pending', 
  'Warehouse', 
  'Customs', 
  'Carrier 1', 
  'Carrier 2', 
  'Shipped', 
  'Delivered'
];

export default function AdminShipment() {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('Pending');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newReceipt, setNewReceipt] = useState({ title: '', amount: '', description: '' });
  const [addingReceipt, setAddingReceipt] = useState(false);
  const navigate = useNavigate();

  const fetchShipment = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setShipment(data);
        setNewStatus(data.status);
        setLocation(data.status === 'Delivered' ? data.destination : '');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shipment) return;
    setUpdating(true);

    try {
      let photoUrl = '';
      if (photo) {
        photoUrl = await toBase64(photo);
      }

      const newHistoryItem: ShipmentHistory = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        location: location || 'Unknown',
        description: description || `Shipment status updated to ${newStatus}`,
        photoUrl: photoUrl || undefined,
      };

      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          history: [...shipment.history, newHistoryItem]
        }),
        credentials: 'include'
      });

      if (response.ok) {
        await fetchShipment();
        setPhoto(null);
        setPhotoPreview(null);
        setDescription('');
        setLocation('');
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleMetaUpdate = async (updates: Partial<Shipment>) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (response.ok) {
        await fetchShipment();
      }
    } catch (error) {
      console.error('Error updating meta info:', error);
    }
  };

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shipment) return;
    setAddingReceipt(true);

    const receipt = {
      id: Math.random().toString(36).substr(2, 9),
      ...newReceipt,
      date: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipts: [...(shipment.receipts || []), receipt]
        }),
        credentials: 'include'
      });

      if (response.ok) {
        await fetchShipment();
        setNewReceipt({ title: '', amount: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding receipt:', error);
    } finally {
      setAddingReceipt(false);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!id || !shipment) return;
    const updatedReceipts = (shipment.receipts || []).filter(r => r.id !== receiptId);
    
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts: updatedReceipts }),
        credentials: 'include'
      });
      if (response.ok) {
        await fetchShipment();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#001f3f]"></div>
      </div>
    );
  }

  if (!shipment) return null;

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-32 pb-40 font-sans">
      <nav className="nexus-glass px-6 py-6 flex items-center justify-between sticky top-0 z-50 border-b border-slate-100 mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin')} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group">
            <ArrowLeft className="w-6 h-6 text-[#001f3f] group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-[#001f3f]">SwiftShip <span className="text-orange-600 hidden sm:inline">Console.</span><span className="text-orange-600 sm:hidden">Cnsl.</span></h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operator Session: Admin HQ</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-black text-[#001f3f] uppercase tracking-widest">{shipment.trackingId}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Update Form */}
        <div className="lg:col-span-2 space-y-12">
          <div className="nexus-card rounded-[3.5rem] border-slate-200 p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />
            <h2 className="text-3xl font-black text-[#001f3f] mb-12 flex items-center gap-6 uppercase tracking-tighter italic">
              <div className="bg-[#001f3f] p-4 rounded-3xl shadow-2xl">
                <Package className="w-8 h-8 text-orange-500" />
              </div>
              Manifest Meta Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2">Transport Protocol</label>
                <select 
                  value={shipment.type}
                  onChange={(e) => handleMetaUpdate({ type: e.target.value as 'Flight' | 'Shipment' })}
                  className="w-full px-8 py-6 bg-slate-50 rounded-3xl outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] appearance-none cursor-pointer border border-slate-100 focus:border-orange-600/20 transition-all uppercase tracking-widest"
                >
                  <option value="Shipment">Industrial Sea/Land</option>
                  <option value="Flight">Global Air Priority</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2">Operator Mapping (User UID)</label>
                <input 
                  type="text" 
                  value={shipment.userId || ''}
                  onChange={(e) => setShipment({...shipment, userId: e.target.value})}
                  onBlur={(e) => handleMetaUpdate({ userId: e.target.value })}
                  placeholder="LINK TO OPERATOR"
                  className="w-full px-8 py-6 bg-slate-50 rounded-3xl outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] border border-slate-100 focus:border-orange-600/20 transition-all uppercase tracking-widest placeholder:text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="nexus-card rounded-[3.5rem] border-slate-200 p-8 md:p-14 relative overflow-hidden">
            <h2 className="text-3xl font-black text-[#001f3f] mb-12 flex items-center gap-6 uppercase tracking-tighter italic">
              <div className="bg-orange-600 p-4 rounded-3xl shadow-2xl">
                <Truck className="w-8 h-8 text-[#001f3f]" />
              </div>
              Status Injection
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2">Operational State</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                    className="w-full px-8 py-6 bg-slate-50 rounded-3xl outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] appearance-none cursor-pointer border border-slate-100 focus:border-orange-600/20 transition-all uppercase tracking-widest italic"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2">Geospatial Coordinate</label>
                  <div className="relative group">
                    <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-orange-600 w-6 h-6" />
                    <input 
                      required
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dubai Central"
                      className="w-full pl-20 pr-8 py-6 bg-slate-50 rounded-3xl outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] border border-slate-100 focus:border-orange-600/20 transition-all uppercase tracking-widest placeholder:text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2">Operation Summary</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ENTRY LOG DESCRIPTION"
                  className="w-full px-8 py-6 bg-slate-50 rounded-[2.5rem] outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] border border-slate-100 focus:border-orange-600/20 transition-all min-h-[160px] resize-none uppercase tracking-widest placeholder:text-slate-200"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-2 block">Asset Verification (Photo Proof)</label>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <label className="w-full md:w-auto flex-1 flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[3rem] p-16 hover:border-orange-600 hover:bg-slate-50 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <div className="bg-white p-5 rounded-3xl shadow-xl mb-6 group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10 text-orange-600" />
                    </div>
                    <span className="text-xs font-black text-[#001f3f] uppercase tracking-widest italic">Inject Asset Imagery</span>
                    <span className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest font-black">Industrial Standard Audit</span>
                  </label>
                  
                  {photoPreview && (
                    <div className="w-full md:w-64 aspect-square rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl relative group">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="absolute inset-0 bg-[#001f3f]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase tracking-widest text-xs"
                      >
                        Purge Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={updating}
                type="submit"
                className="w-full bg-[#001f3f] text-white py-8 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-4 disabled:opacity-50 group active:scale-95"
              >
                {updating ? (
                  <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
                ) : (
                  <>
                    <Send className="w-6 h-6 text-orange-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Execute Status Pulse
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Preview */}
          <div className="nexus-card rounded-[3.5rem] border-slate-200 p-8 md:p-14">
            <h3 className="text-3xl font-black text-[#001f3f] mb-12 uppercase tracking-tighter italic leading-none text-right">Event <br /> <span className="text-orange-600">Manifest.</span></h3>
            <div className="space-y-12">
              {(shipment.history || []).slice().reverse().map((event, i) => (
                <div key={i} className="flex gap-10 group">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#001f3f] shadow-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:rotate-6 transition-all border-4 border-white">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    {i !== (shipment.history || []).length - 1 && <div className="w-1.5 flex-1 bg-slate-50 my-4 rounded-full group-hover:bg-orange-600/20 transition-colors"></div>}
                  </div>
                  <div className="flex-1 pb-12">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter italic leading-none">{event.status}</h4>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-orange-600" />
                        {format(new Date(event.timestamp), 'MMM dd | HH:mm')}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-black leading-relaxed mb-6 uppercase tracking-widest italic">{event.description}</p>
                    {event.photoUrl && (
                      <div className="relative w-64 aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform">
                        <img src={event.photoUrl} alt="Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipts Section */}
          <div className="bg-white rounded-3xl md:rounded-[3rem] shadow-2xl border border-gray-100 p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h2 className="text-xl md:text-2xl font-black text-[#001f3f] mb-8 md:mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
              <div className="bg-[#001f3f] p-3 rounded-2xl shadow-xl rotate-3">
                <FileText className="w-6 h-6 text-orange-500" />
              </div>
              Shipment Receipts
            </h2>

            <form onSubmit={handleAddReceipt} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={newReceipt.title}
                  onChange={(e) => setNewReceipt({...newReceipt, title: e.target.value})}
                  placeholder="e.g. Customs Fee"
                  className="w-full px-6 py-4 bg-white rounded-xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount</label>
                <input 
                  required
                  type="text" 
                  value={newReceipt.amount}
                  onChange={(e) => setNewReceipt({...newReceipt, amount: e.target.value})}
                  placeholder="e.g. $150.00"
                  className="w-full px-6 py-4 bg-white rounded-xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button 
                  disabled={addingReceipt}
                  type="submit"
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#001f3f] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Receipt
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {(shipment.receipts || []).length > 0 ? (
                (shipment.receipts || []).map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-500/30 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <FileText className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#001f3f] uppercase tracking-tight italic">{receipt.title}</h4>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{receipt.amount}</span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(receipt.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReceipt(receipt.id)}
                      className="p-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No receipts recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Details Sidebar */}
        <div className="space-y-12">
          {shipment.productImage && (
            <div className="nexus-card p-4 rounded-[3.5rem] border-slate-200">
              <div className="aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src={shipment.productImage} 
                  alt="Asset" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="nexus-card rounded-[3.5rem] border-slate-200 p-10 md:p-14 relative overflow-hidden">
            <h3 className="text-2xl font-black text-[#001f3f] mb-8 uppercase tracking-tighter italic">Asset <span className="text-orange-600">Diagnostics.</span></h3>
            <div className="space-y-10">
              <div className="pb-8 border-b border-slate-50">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 block mb-4 italic">Designation</span>
                <p className="font-black text-2xl text-[#001f3f] italic leading-tight uppercase tracking-tighter">{shipment.productName || 'UNIDENTIFIED'}</p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 block mb-4 italic">Operational Mass</span>
                  <p className="font-black text-lg text-[#001f3f] italic uppercase">{shipment.weight ? `${shipment.weight}_KG` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 block mb-4 italic">Dim_X_Y_Z</span>
                  <p className="font-black text-lg text-[#001f3f] italic uppercase">{shipment.dimensions || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#001f3f] text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/20 rounded-full -mr-24 -mt-24 blur-[60px]" />
            <div className="flex items-center gap-6 mb-10">
              <div className="bg-orange-600 p-3 rounded-2xl shadow-xl">
                <AlertCircle className="w-8 h-8 text-[#001f3f]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Admin <span className="text-orange-600">Protocol.</span></h3>
            </div>
            <div className="space-y-6">
              <p className="text-[11px] font-black leading-relaxed opacity-40 uppercase tracking-[0.2em] italic">
                Verified Personnel Action Required. All logs are synced to Global Manifest V4.2. Precision is the primary directive.
              </p>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60">
                <span>Access Node:</span>
                <span className="text-orange-500">SecureHQ_01</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
