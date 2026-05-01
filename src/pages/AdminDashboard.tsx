import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shipment, ShipmentStatus } from '../types';
import { Plus, Search, Truck, Package, MapPin, Clock, ArrowRight, LayoutDashboard, MessageSquare, LogOut, Filter, CheckCircle2, Plane, RefreshCw, Menu, X, Trash2, Users, Edit3, Camera, Send, Loader2, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useAuth } from '../App';

export default function AdminDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'shipments' | 'users' | 'logs'>('shipments');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ShipmentStatus | ''>('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updatePhoto, setUpdatePhoto] = useState<string | null>(null);
  const [newReceipt, setNewReceipt] = useState({ title: '', amount: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const { logout, user } = useAuth();
  const [newShipment, setNewShipment] = useState({
    trackingId: '',
    type: 'Shipment' as 'Flight' | 'Shipment',
    customerEmail: '',
    userId: '',
    origin: '',
    destination: '',
    status: 'Pending' as ShipmentStatus,
    productName: '',
    productDescription: '',
    productImage: '',
    weight: '',
    dimensions: '',
  });
  const navigate = useNavigate();

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments', { credentials: 'include' });
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg += `: ${errorData.error || response.statusText}`;
        } catch (e) {
          errorMsg += `: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setShipments(data);
      } else {
        console.error('Expected array of shipments, got:', data);
        setShipments([]);
      }
    } catch (error) {
      console.error('Detailed error fetching shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchShipments();
    fetchUsers();
    fetchLogs();
    const interval = setInterval(() => {
      fetchShipments();
      fetchUsers();
      fetchLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const generateTrackingId = () => {
    return `LT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trackingId = newShipment.trackingId || generateTrackingId();
    
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newShipment,
          trackingId,
          history: [{
            status: 'Pending',
            timestamp: new Date().toISOString(),
            location: newShipment.origin,
            description: `Shipment created and ${newShipment.type === 'Flight' ? 'flight' : 'shipment'} scheduled.`,
          }],
        }),
        credentials: 'include'
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewShipment({ 
          trackingId: '',
          type: 'Shipment',
          customerEmail: '', 
          userId: '',
          origin: '', 
          destination: '', 
          status: 'Pending',
          productName: '',
          productDescription: '',
          productImage: '',
          weight: '',
          dimensions: '',
        });
        fetchShipments();
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this shipment? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        fetchShipments();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete shipment');
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
      alert('An error occurred while deleting the shipment');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment || !updateStatus) return;
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          history: [
            ...(editingShipment.history || []),
            {
              status: updateStatus,
              timestamp: new Date().toISOString(),
              location: editingShipment.destination,
              description: updateDescription || `Shipment status updated to ${updateStatus}`,
              photoUrl: updatePhoto || undefined,
            }
          ]
        }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setUpdateStatus('');
        setUpdateDescription('');
        setUpdatePhoto(null);
        fetchShipments();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;

    const receipt = {
      id: Math.random().toString(36).substr(2, 9),
      ...newReceipt,
      date: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipts: [...(editingShipment.receipts || []), receipt]
        }),
      });

      if (response.ok) {
        const updatedShipment = {
          ...editingShipment,
          receipts: [...(editingShipment.receipts || []), receipt]
        };
        setEditingShipment(updatedShipment);
        setNewReceipt({ title: '', amount: '', description: '' });
        fetchShipments();
      }
    } catch (error) {
      console.error('Error adding receipt:', error);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!editingShipment) return;
    const updatedReceipts = (editingShipment.receipts || []).filter(r => r.id !== receiptId);
    
    try {
      const response = await fetch(`/api/shipments/${editingShipment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts: updatedReceipts }),
      });
      if (response.ok) {
        const updatedShipment = {
          ...editingShipment,
          receipts: updatedReceipts
        };
        setEditingShipment(updatedShipment);
        fetchShipments();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const filteredShipments = Array.isArray(shipments) ? shipments.filter(s => 
    s.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewShipment({ ...newShipment, productImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#001f3f] text-white p-4 flex items-center justify-between sticky top-0 z-[60] shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-[#001f3f]" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">Peak<span className="text-orange-500">Logistics</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#001f3f] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:flex items-center gap-3 border-b border-white/10">
          <div className="bg-orange-600 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-[#001f3f]" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Peak<span className="text-orange-500">Logistics</span></span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => { setActiveTab('shipments'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'shipments' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Shipments
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Registered Users
          </button>
          <button 
            onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'logs' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            Operations Log
          </button>
          <button 
            onClick={() => { navigate('/admin/tickets'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Support Tickets
          </button>
          <div className="pt-4 mt-4 border-t border-white/5">
            <button 
              onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              User Dashboard
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-auto pb-24 md:pb-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#001f3f] tracking-tight mb-2 uppercase italic">
              {activeTab === 'shipments' ? 'Shipment Dashboard' : activeTab === 'users' ? 'User Management' : 'Admin Operations Log'}
            </h1>
            <p className="text-gray-500 font-medium text-sm md:text-base">
              {activeTab === 'shipments' 
                ? 'Manage and monitor all active shipments in your network.' 
                : activeTab === 'users' ? 'View and manage all registered users in the system.' : 'Real-time audit log of all system and administrative actions.'}
            </p>
          </div>
          {activeTab === 'shipments' && (
            <button 
              onClick={() => {
                setNewShipment({...newShipment, trackingId: generateTrackingId()});
                setIsModalOpen(true);
              }}
              className="w-full md:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              New Shipment
            </button>
          )}
        </header>

        {activeTab === 'shipments' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-blue-50 p-3 rounded-xl w-fit mb-4">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Shipments</p>
                <h3 className="text-3xl font-black text-[#001f3f]">{Array.isArray(shipments) ? shipments.length : 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-orange-50 p-3 rounded-xl w-fit mb-4">
                  <Truck className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">In Transit</p>
                <h3 className="text-3xl font-black text-[#001f3f]">{Array.isArray(shipments) ? shipments.filter(s => s.status === 'In Transit' || s.status === 'Shipped').length : 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-purple-50 p-3 rounded-xl w-fit mb-4">
                  <MapPin className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Custom Clearance</p>
                <h3 className="text-3xl font-black text-[#001f3f]">{Array.isArray(shipments) ? shipments.filter(s => s.status === 'Customs' || s.status === 'Custom Clearance').length : 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-green-50 p-3 rounded-xl w-fit mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Delivered</p>
                <h3 className="text-3xl font-black text-[#001f3f]">{Array.isArray(shipments) ? shipments.filter(s => s.status === 'Delivered').length : 0}</h3>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by Tracking ID or Customer Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium text-[#001f3f]"
                />
              </div>
            </div>

            {/* Shipments Table / Cards */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Shipment</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Customer</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Route</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                        </td>
                      </tr>
                    ) : filteredShipments.length > 0 ? (
                      filteredShipments.map((shipment) => (
                        <tr key={shipment.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${shipment.type === 'Flight' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                {shipment.type === 'Flight' ? <Plane className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="font-mono font-bold text-[#001f3f] text-lg">{shipment.trackingId}</div>
                                <div className="text-[10px] uppercase font-black text-gray-400">{shipment.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-[#001f3f]">{shipment.customerEmail}</p>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                              <span className="truncate max-w-[100px]">{shipment.origin}</span>
                              <ArrowRight className="w-3 h-3 text-orange-500" />
                              <span className="truncate max-w-[100px]">{shipment.destination}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              shipment.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                              shipment.status === 'In Transit' || shipment.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              shipment.status === 'Custom Clearance' || shipment.status === 'Customs' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                              {shipment.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingShipment(shipment);
                                  setUpdateStatus(shipment.status);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#001f3f] hover:text-white transition-all group-hover:shadow-lg"
                                title="Update Status"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteShipment(shipment.id)}
                                className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transition-all group-hover:shadow-lg"
                                title="Delete Shipment"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                          No shipments found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <div key={shipment.id} className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${shipment.type === 'Flight' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {shipment.type === 'Flight' ? <Plane className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-mono font-bold text-[#001f3f] text-base">{shipment.trackingId}</div>
                            <div className="text-[10px] uppercase font-black text-gray-400">{shipment.type}</div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                          shipment.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                          shipment.status === 'In Transit' || shipment.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          shipment.status === 'Custom Clearance' || shipment.status === 'Customs' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer</p>
                        <p className="font-bold text-[#001f3f] text-sm">{shipment.customerEmail}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Route</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#001f3f]">
                          <span>{shipment.origin}</span>
                          <ArrowRight className="w-3 h-3 text-orange-500" />
                          <span>{shipment.destination}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setEditingShipment(shipment);
                            setUpdateStatus(shipment.status);
                            setIsEditModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#001f3f] text-white text-xs font-black uppercase tracking-widest"
                        >
                          <Edit3 className="w-4 h-4" />
                          Update
                        </button>
                        <button 
                          onClick={() => handleDeleteShipment(shipment.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest border border-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-400 font-medium text-sm">
                    No shipments found matching your search.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-gray-400">UID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-500" />
                          </div>
                          <span className="font-bold text-[#001f3f]">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-xs font-mono text-gray-400">{u.uid}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile User Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <div key={u.uid} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#001f3f] text-sm truncate">{u.email}</p>
                      <code className="text-[10px] font-mono text-gray-400 truncate block">{u.uid}</code>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0 ${
                    u.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex gap-6 pb-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 p-4 rounded-2xl transition-all">
                    <div className="h-12 w-12 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-[#001f3f] uppercase tracking-tight italic">{log.action}</h4>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mb-2">{log.details}</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.user}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-400 font-medium">
                  No operational records found.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Shipment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full h-full md:h-auto md:max-w-xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 bg-[#001f3f] text-white shrink-0 flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Create New Shipment</h2>
                  <p className="text-gray-400 text-[10px] md:text-sm mt-1">Enter shipment details to generate tracking ID.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateShipment} className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tracking ID</label>
                    <div className="flex gap-2">
                      <input 
                        required
                        type="text" 
                        value={newShipment.trackingId}
                        onChange={(e) => setNewShipment({...newShipment, trackingId: e.target.value})}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                      />
                      <button 
                        type="button"
                        onClick={() => setNewShipment({...newShipment, trackingId: generateTrackingId()})}
                        className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
                      >
                        <RefreshCw className="w-5 h-5 text-[#001f3f]" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Shipment Type</label>
                    <select 
                      value={newShipment.type}
                      onChange={(e) => setNewShipment({...newShipment, type: e.target.value as any})}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    >
                      <option value="Shipment">Sea/Land Shipment</option>
                      <option value="Flight">Air Flight</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Customer Email</label>
                    <input 
                      required
                      type="email" 
                      value={newShipment.customerEmail}
                      onChange={(e) => setNewShipment({...newShipment, customerEmail: e.target.value})}
                      placeholder="customer@example.com"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">User ID (Optional)</label>
                    <input 
                      type="text" 
                      value={newShipment.userId}
                      onChange={(e) => setNewShipment({...newShipment, userId: e.target.value})}
                      placeholder="Link to user account"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Origin</label>
                    <input 
                      required
                      type="text" 
                      value={newShipment.origin}
                      onChange={(e) => setNewShipment({...newShipment, origin: e.target.value})}
                      placeholder="City, Country"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Destination</label>
                    <input 
                      required
                      type="text" 
                      value={newShipment.destination}
                      onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
                      placeholder="City, Country"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Product Name</label>
                  <input 
                    type="text" 
                    value={newShipment.productName}
                    onChange={(e) => setNewShipment({...newShipment, productName: e.target.value})}
                    placeholder="e.g. iPhone 15 Pro"
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Product Description</label>
                  <textarea 
                    value={newShipment.productDescription}
                    onChange={(e) => setNewShipment({...newShipment, productDescription: e.target.value})}
                    placeholder="Enter product details..."
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Weight (kg)</label>
                    <input 
                      type="text" 
                      value={newShipment.weight}
                      onChange={(e) => setNewShipment({...newShipment, weight: e.target.value})}
                      placeholder="e.g. 2.5"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Dimensions (cm)</label>
                    <input 
                      type="text" 
                      value={newShipment.dimensions}
                      onChange={(e) => setNewShipment({...newShipment, dimensions: e.target.value})}
                      placeholder="e.g. 20x15x10"
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Product Image</label>
                  <div className="flex flex-col gap-4">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    />
                    {newShipment.productImage && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-100">
                        <img 
                          src={newShipment.productImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setNewShipment({...newShipment, productImage: ''})}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-4 sticky bottom-0 bg-white pb-2 mt-auto">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg text-sm"
                  >
                    Create Shipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Shipment Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingShipment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-[#001f3f]/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 bg-[#001f3f] text-white sticky top-0 z-10 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Update Shipment</h2>
                  <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-bold">ID: {editingShipment.trackingId}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 space-y-10">
                {/* Status Update Form */}
                <form onSubmit={handleUpdateStatus} className="space-y-6 pb-10 border-b border-gray-100">
                  <h3 className="text-lg font-black text-[#001f3f] uppercase tracking-tight italic flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-orange-500" />
                    Status & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Status</label>
                      <select 
                        required
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value as ShipmentStatus)}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Warehouse">Warehouse</option>
                        <option value="Customs">Customs</option>
                        <option value="Carrier 1">Carrier 1</option>
                        <option value="Carrier 2">Carrier 2</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                      <input 
                        type="text"
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        placeholder="e.g. Arrived at London Hub"
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Update Photo (Optional)</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50 cursor-pointer transition-all">
                        <Camera className="w-5 h-5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Proof</span>
                        <input type="file" accept="image/*" onChange={handleUpdatePhotoChange} className="hidden" />
                      </label>
                      {updatePhoto && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100">
                          <img src={updatePhoto} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setUpdatePhoto(null)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    disabled={isUpdating}
                    type="submit"
                    className="w-full bg-[#001f3f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    Post Status Update
                  </button>
                </form>

                {/* Receipts Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-[#001f3f] uppercase tracking-tight italic flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Shipment Receipts
                  </h3>
                  
                  <form onSubmit={handleAddReceipt} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title</label>
                      <input 
                        required
                        type="text" 
                        value={newReceipt.title}
                        onChange={(e) => setNewReceipt({...newReceipt, title: e.target.value})}
                        placeholder="e.g. Customs"
                        className="w-full px-4 py-3 bg-white rounded-xl outline-none text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Amount</label>
                      <input 
                        required
                        type="text" 
                        value={newReceipt.amount}
                        onChange={(e) => setNewReceipt({...newReceipt, amount: e.target.value})}
                        placeholder="e.g. $150"
                        className="w-full px-4 py-3 bg-white rounded-xl outline-none text-sm font-bold"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit"
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#001f3f] transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {(editingShipment.receipts || []).length > 0 ? (
                      (editingShipment.receipts || []).map((receipt) => (
                        <div key={receipt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                          <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <FileText className="w-4 h-4 text-orange-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#001f3f] uppercase tracking-tight italic">{receipt.title}</h4>
                              <div className="flex gap-3 mt-0.5">
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{receipt.amount}</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(receipt.date), 'MMM d')}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-2xl">No receipts added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
