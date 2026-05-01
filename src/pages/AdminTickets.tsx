import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Message } from '../types';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, User, LayoutDashboard, LogOut, Truck, Menu, X, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../App';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets', { credentials: 'include' });
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
      setTickets(data);
      if (selectedTicket) {
        const updated = data.find((t: Ticket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Detailed error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply.trim() }),
        credentials: 'include'
      });
      if (response.ok) {
        setReply('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
        credentials: 'include'
      });
      if (response.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md w-full">
          <div className="bg-red-50 p-6 rounded-full w-fit mx-auto mb-8">
            <Truck className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-4">Access Denied</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-10">You do not have administrative privileges</p>
          <button onClick={() => navigate('/')} className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#001f3f] text-white p-6 flex items-center justify-between sticky top-0 z-[60] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-[#001f3f]" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Peak<span className="text-orange-600">Console.</span></span>
        </div>
        <div className="flex items-center gap-2">
          {selectedTicket && (
            <button 
              onClick={() => setSelectedTicket(null)}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#001f3f] text-white flex flex-col shadow-[20px_0_100px_rgba(0,0,0,0.5)] transition-transform duration-500 md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-10 hidden md:flex items-center gap-4 border-b border-white/5">
          <div className="bg-orange-600 p-3 rounded-2xl shadow-2xl rotate-3">
            <Zap className="w-6 h-6 text-[#001f3f]" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Peak<span className="text-orange-600">HQ.</span></span>
        </div>
        
        <nav className="flex-1 p-8 space-y-4 overflow-y-auto">
          <button 
            onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Operations Grid
          </button>
          <button 
            onClick={() => { navigate('/admin/tickets'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] bg-orange-600 text-[#001f3f] shadow-2xl shadow-orange-600/20 font-black uppercase tracking-widest text-[10px] transition-all italic"
          >
            <MessageSquare className="w-5 h-5" />
            Tactical Comms
          </button>
          <div className="pt-8 mt-8 border-t border-white/5">
            <button 
              onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] text-slate-400 hover:bg-white/5 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
              Public Console
            </button>
          </div>
        </nav>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-[2rem] text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <LogOut className="w-5 h-5" />
            Terminate
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-slate-50/50">
        <header className="p-8 md:p-14 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-20">
          <div>
            <div className="text-orange-600 font-black uppercase tracking-[0.6em] text-[10px] mb-4">Command Center Support</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#001f3f] tracking-tighter uppercase italic leading-none mb-3">Tactical <span className="text-slate-300">Uplink.</span></h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[9px]">Node 01: Secure Communication Manifest</p>
          </div>
          <div className="hidden xl:flex gap-10">
            <div className="nexus-card px-10 py-6 rounded-[2.5rem] border-slate-200">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1 italic">Active Inquiries</span>
              <span className="text-4xl font-black text-[#001f3f] italic leading-none">{tickets.filter(t => t.status === 'open').length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Ticket List */}
          <div className={`
            w-full md:w-[450px] border-r border-slate-100 bg-white overflow-y-auto shadow-sm pb-24 md:pb-0
            ${selectedTicket ? 'hidden md:block' : 'block'}
          `}>
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Incoming Packets</h2>
            </div>
            {loading ? (
              <div className="p-32 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mx-auto"></div>
              </div>
            ) : tickets.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {tickets.map((ticket, i) => (
                  <button 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-10 text-left hover:bg-slate-50/50 transition-all flex flex-col gap-6 group relative overflow-hidden ${
                      selectedTicket?.id === ticket.id ? 'bg-slate-50 border-r-8 border-orange-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        ticket.status === 'open' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-orange-500 animate-pulse' : 'bg-slate-300'}`} />
                        {ticket.status}
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic group-hover:text-orange-600 transition-colors">
                        {format(new Date(ticket.createdAt), 'MMM dd')}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <p className="font-black text-xl text-[#001f3f] truncate w-full uppercase tracking-tighter italic group-hover:translate-x-2 transition-transform">
                        {ticket.messages[0]?.text}
                      </p>
                      <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <User className="w-4 h-4 text-orange-600" />
                        <span className="truncate">{ticket.customerEmail || ticket.customerId}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-32 text-center">
                <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <MessageSquare className="w-10 h-10 text-slate-100" />
                </div>
                <p className="text-slate-200 font-black uppercase tracking-[0.5em] text-[10px]">No Signals Detected</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className={`
            flex-1 flex flex-col bg-slate-50/30 pb-24 md:pb-0 relative
            ${selectedTicket ? 'block' : 'hidden md:flex'}
          `}>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.02),transparent_70%)] pointer-events-none" />

            {selectedTicket ? (
              <>
                <div className="p-8 md:p-12 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0 sticky top-0 z-10">
                  <div className="flex items-center gap-8">
                    <div className="bg-[#001f3f] p-5 rounded-3xl shadow-2xl rotate-3 border-4 border-white">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-4">
                        <h3 className="font-black text-[#001f3f] uppercase tracking-tighter italic text-2xl">Session_{selectedTicket.id?.slice(-6).toUpperCase()}</h3>
                        <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full text-[9px] font-black text-orange-500 uppercase tracking-widest shadow-2xl border border-white/5">
                          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                          In_Uplink
                        </div>
                      </div>
                      <p className="text-[9px] font-black text-slate-300 tracking-[0.3em] uppercase mt-2 italic truncate max-w-[200px] xl:max-w-none">Target: {selectedTicket.customerEmail || selectedTicket.customerId}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-slate-50 text-slate-300 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all border border-slate-100 shadow-sm group"
                  >
                    <CheckCircle2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Terminate Connection
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 md:p-16 space-y-12 relative z-0">
                  {selectedTicket.messages.map((msg, i) => {
                    const isAdmin = msg.sender === 'Admin';
                    return (
                      <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] xl:max-w-[60%] p-10 rounded-[3rem] relative ${
                          isAdmin 
                            ? 'bg-[#001f3f] text-white rounded-tr-none shadow-[0_30px_60px_-15px_rgba(0,31,63,0.3)]' 
                            : 'bg-white text-[#001f3f] rounded-tl-none border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]'
                        }`}>
                          <p className="font-black leading-relaxed text-lg xl:text-xl italic uppercase tracking-tight">{msg.text}</p>
                          <div className={`mt-6 pt-6 border-t flex justify-between items-center ${isAdmin ? 'border-white/5' : 'border-slate-50'}`}>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{isAdmin ? 'OPERATOR' : 'CLIENT'}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                              {format(new Date(msg.timestamp), 'HH:mm | MMM dd')}
                            </span>
                          </div>
                          {/* Tactical accent */}
                          <div className={`absolute top-0 ${isAdmin ? 'right-0' : 'left-0'} w-12 h-1 bg-orange-600 rounded-full blur-[2px] opacity-50`} />
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-10 md:p-14 bg-white/70 backdrop-blur-xl border-t border-slate-100 shadow-2xl shrink-0 z-10">
                  <form onSubmit={handleSendReply} className="flex gap-6 max-w-5xl mx-auto">
                    <input 
                      type="text" 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="ENTER COMMAND RESPONSE..."
                      className="flex-1 px-10 py-6 bg-slate-50 rounded-[2.5rem] outline-none focus:ring-4 ring-orange-600/10 font-black text-[#001f3f] border border-transparent focus:border-orange-600/20 transition-all text-sm uppercase tracking-widest placeholder:text-slate-200"
                    />
                    <button 
                      type="submit"
                      className="bg-[#001f3f] text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-2xl shadow-indigo-900/20 flex items-center gap-4 group active:scale-95"
                    >
                      <Send className="w-6 h-6 text-orange-600 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      <span className="hidden sm:inline">Dispatch Signal</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
                <div className="bg-white p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] mb-12 rotate-6 relative z-10 group hover:rotate-0 transition-transform duration-700">
                  <MessageSquare className="w-24 h-24 text-orange-600 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#001f3f] rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-600 animate-pulse font-black" />
                  </div>
                </div>
                <h2 className="text-5xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-6 leading-none z-10">Awaiting <br /> <span className="text-orange-600 text-6xl">Packet Choice.</span></h2>
                <p className="text-slate-400 max-w-md font-black uppercase tracking-[0.4em] text-[10px] leading-relaxed z-10 italic">Select an active support vector from the operations manifest to establish secure uplink.</p>
                
                {/* Background Decoration */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] -mr-64 -mb-64" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
