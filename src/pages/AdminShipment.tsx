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
      const response = await fetch(`/api/shipments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setShipment(data);
        setNewStatus(data.status);
        setLocation(data.status === 'Delivered' ? data.destination : '');
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
      });

      if (response.ok) {
        await fetchShipment();
        setPhoto(null);
        setPhotoPreview(null);
        setDescription('');
        setLocation('');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <nav className="bg-[#001f3f] text-white px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter italic">Update <span className="text-orange-500">Shipment</span></h1>
            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-1">{shipment.trackingId}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Update Form */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h2 className="text-2xl font-black text-[#001f3f] mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
              <div className="bg-[#001f3f] p-3 rounded-2xl shadow-xl rotate-3">
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              Shipment Meta Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Shipment Type</label>
                <select 
                  value={shipment.type}
                  onChange={(e) => handleMetaUpdate({ type: e.target.value as 'Flight' | 'Shipment' })}
                  className="w-full px-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-black text-[#001f3f] appearance-none cursor-pointer border border-transparent focus:border-orange-500/20 transition-all"
                >
                  <option value="Shipment">Sea/Land Shipment</option>
                  <option value="Flight">Air Flight</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">User ID (Link to Account)</label>
                <input 
                  type="text" 
                  value={shipment.userId || ''}
                  onChange={(e) => setShipment({...shipment, userId: e.target.value})}
                  onBlur={(e) => handleMetaUpdate({ userId: e.target.value })}
                  placeholder="Enter User UID"
                  className="w-full px-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
            <h2 className="text-2xl font-black text-[#001f3f] mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
              <div className="bg-orange-500 p-3 rounded-2xl shadow-xl -rotate-3">
                <Truck className="w-6 h-6 text-white" />
              </div>
              Update Status & Location
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">New Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-black text-[#001f3f] appearance-none cursor-pointer border border-transparent focus:border-orange-500/20 transition-all"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Current Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
                    <input 
                      required
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., London Hub, UK"
                      className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Update Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the current state of the shipment..."
                  className="w-full px-8 py-5 bg-gray-50 rounded-3xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all min-h-[140px] resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Visual Proof (Photo)</label>
                <div className="flex items-start gap-8">
                  <label className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10 text-orange-500" />
                    </div>
                    <span className="text-sm font-black text-[#001f3f] uppercase tracking-widest italic">Upload Proof</span>
                    <span className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">JPG, PNG up to 5MB</span>
                  </label>
                  
                  {photoPreview && (
                    <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative group">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                        className="absolute inset-0 bg-[#001f3f]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black uppercase tracking-widest text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={updating}
                type="submit"
                className="w-full bg-[#001f3f] text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing Update...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Post Update
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Preview */}
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12">
            <h3 className="text-2xl font-black text-[#001f3f] mb-10 uppercase tracking-tighter italic">Shipment <span className="text-orange-500">History</span></h3>
            <div className="space-y-10">
              {(shipment.history || []).slice().reverse().map((event, i) => (
                <div key={i} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#001f3f] shadow-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    {i !== (shipment.history || []).length - 1 && <div className="w-1 flex-1 bg-gray-100 my-3 rounded-full"></div>}
                  </div>
                  <div className="flex-1 pb-10">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-black text-[#001f3f] uppercase tracking-tight italic">{event.status}</h4>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{format(new Date(event.timestamp), 'MMM d, HH:mm')}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-4 uppercase tracking-wide">{event.description}</p>
                    {event.photoUrl && (
                      <div className="relative w-48 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                        <img src={event.photoUrl} alt="Proof" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipts Section */}
          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h2 className="text-2xl font-black text-[#001f3f] mb-10 flex items-center gap-4 uppercase tracking-tighter italic">
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

        {/* Shipment Details Sidebar */}
        <div className="space-y-10">
          {shipment.productImage && (
            <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-2 overflow-hidden">
              <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={shipment.productImage} 
                  alt="Product" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#001f3f]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            <h3 className="text-xl font-black text-[#001f3f] mb-8 uppercase tracking-tighter italic">Product <span className="text-orange-500">Info</span></h3>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Product Name</span>
                <p className="font-black text-[#001f3f] italic">{shipment.productName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Description</span>
                <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-wide">{shipment.productDescription || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Weight</span>
                  <p className="font-black text-[#001f3f] text-sm italic">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Dimensions</span>
                  <p className="font-black text-[#001f3f] text-sm italic">{shipment.dimensions || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#001f3f]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
            <h3 className="text-xl font-black text-[#001f3f] mb-8 uppercase tracking-tighter italic">Shipment <span className="text-orange-500">Details</span></h3>
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Customer Account</span>
                <p className="font-black text-[#001f3f] truncate italic">{shipment.customerEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Origin</span>
                  <p className="font-black text-[#001f3f] text-sm italic">{shipment.origin}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Destination</span>
                  <p className="font-black text-[#001f3f] text-sm italic">{shipment.destination}</p>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Registered On</span>
                <p className="font-black text-[#001f3f] text-sm italic">
                  {format(new Date(shipment.createdAt), 'PPP p')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#001f3f] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-orange-500 p-2 rounded-xl shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Admin <span className="text-orange-500">Protocol</span></h3>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">
              Ensure all photo uploads are high resolution. Status updates are broadcasted to elite clients immediately. Maintain professional communication in descriptions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
