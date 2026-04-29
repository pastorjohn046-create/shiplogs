import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Message } from '../types';
import { MessageSquare, ArrowLeft, Send, CheckCircle2, User, LayoutDashboard, LogOut, Truck, Menu, X, Zap, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#001f3f] text-white p-4 flex items-center justify-between sticky top-0 z-[60] shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-[#001f3f]" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">Nexus<span className="text-orange-500">Logistics</span></span>
        </div>
        <div className="flex items-center gap-2">
          {selectedTicket && (
            <button 
              onClick={() => setSelectedTicket(null)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#001f3f] text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:flex items-center gap-3 border-b border-white/10">
          <div className="bg-orange-500 p-2 rounded-xl">
            <Shield className="w-6 h-6 text-[#001f3f]" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Nexus<span className="text-orange-500">Logistics</span></span>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Shipments
          </button>
          <button 
            onClick={() => { navigate('/admin/tickets'); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-orange-500 text-white shadow-lg font-bold transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Support Tickets
          </button>
          <div className="pt-4 mt-4 border-t border-white/5">
            <button 
              onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
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
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        <header className="p-6 md:p-12 bg-white border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-[#001f3f] tracking-tighter mb-1 md:mb-2 uppercase italic">Nexus <span className="text-orange-500">Support</span></h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Manage customer inquiries and elite support tickets</p>
          </div>
          <div className="hidden md:flex gap-6">
            <div className="bg-orange-50 px-8 py-4 rounded-[2rem] border border-orange-100 shadow-sm">
              <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block mb-1">Active Inquiries</span>
              <span className="text-3xl font-black text-orange-700 italic">{tickets.filter(t => t.status === 'open').length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Ticket List */}
          <div className={`
            w-full md:w-[400px] border-r border-gray-100 bg-white overflow-y-auto shadow-sm pb-24 md:pb-0
            ${selectedTicket ? 'hidden md:block' : 'block'}
          `}>
            <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Incoming Tickets</h2>
            </div>
            {loading ? (
              <div className="p-12 md:p-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-4 border-orange-500 border-t-transparent mx-auto"></div>
              </div>
            ) : tickets.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <button 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-6 md:p-8 text-left hover:bg-gray-50 transition-all flex flex-col gap-3 md:gap-4 group ${
                      selectedTicket?.id === ticket.id ? 'bg-orange-50/50 border-r-4 border-orange-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest border ${
                        ticket.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {format(new Date(ticket.createdAt), 'MMM d')}
                      </span>
                    </div>
                    <p className="font-black text-[#001f3f] truncate w-full uppercase tracking-tight italic group-hover:text-orange-500 transition-colors text-sm md:text-base">
                      {ticket.messages[0]?.text}
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <User className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                      <span className="truncate">{ticket.customerEmail || ticket.customerId}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 md:p-20 text-center">
                <div className="bg-gray-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-200" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[8px] md:text-[10px]">No tickets found</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className={`
            flex-1 flex flex-col bg-gray-50 pb-24 md:pb-0
            ${selectedTicket ? 'block' : 'hidden md:flex'}
          `}>
            {selectedTicket ? (
              <>
                <div className="p-4 md:p-8 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="bg-orange-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl rotate-3">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <h3 className="font-black text-[#001f3f] uppercase tracking-tight italic text-base md:text-xl">Ticket #{selectedTicket.id?.slice(-6) || '......'}</h3>
                        <div className="flex items-center gap-1 bg-green-50 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-green-100">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-[7px] md:text-[8px] font-black text-green-700 uppercase tracking-widest">Live</span>
                        </div>
                      </div>
                      <p className="text-[8px] md:text-[10px] font-black text-gray-400 tracking-widest uppercase mt-0.5 md:mt-1 truncate max-w-[150px] md:max-w-none">Customer: {selectedTicket.customerEmail || selectedTicket.customerId}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                    className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 font-black uppercase tracking-widest text-[8px] md:text-[10px] transition-all border border-gray-100 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Close Ticket</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8">
                  {selectedTicket.messages.map((msg, i) => {
                    const isAdmin = msg.sender === 'Admin';
                    return (
                      <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[70%] p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-lg md:shadow-xl relative ${
                          isAdmin 
                            ? 'bg-[#001f3f] text-white rounded-tr-none' 
                            : 'bg-white text-[#001f3f] rounded-tl-none border border-gray-100'
                        }`}>
                          <p className="font-bold leading-relaxed text-sm md:text-lg italic">{msg.text}</p>
                          <span className={`text-[8px] md:text-[10px] font-black mt-3 md:mt-4 block uppercase tracking-widest ${
                            isAdmin ? 'text-gray-400' : 'text-gray-300'
                          }`}>
                            {format(new Date(msg.timestamp), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-6 md:p-10 bg-white border-t border-gray-100 shadow-2xl shrink-0">
                  <form onSubmit={handleSendReply} className="flex gap-3 md:gap-6">
                    <input 
                      type="text" 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type response..."
                      className="flex-1 px-6 md:px-10 py-4 md:py-6 bg-gray-50 rounded-xl md:rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all text-sm md:text-base"
                    />
                    <button 
                      type="submit"
                      className="bg-orange-500 text-white px-6 md:px-12 py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-[#001f3f] transition-all shadow-xl flex items-center gap-2 md:gap-3 active:scale-95"
                    >
                      <Send className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl mb-6 md:mb-10 rotate-3">
                  <MessageSquare className="w-12 h-12 md:w-20 md:h-20 text-orange-500" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-2 md:mb-4">Select a <span className="text-orange-500">Ticket</span></h2>
                <p className="text-gray-400 max-w-sm font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Choose a ticket from the sidebar to start responding to customer inquiries</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
