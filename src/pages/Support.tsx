import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Message } from '../types';
import { MessageSquare, Send, ArrowLeft, Plus, AlertCircle, Menu, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';

export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketText, setNewTicketText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    if (!user) return;
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
  }, [user, selectedTicket?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim() || !user) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage.trim() }),
        credentials: 'include'
      });
      if (response.ok) {
        setNewMessage('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketText.trim() || !user) return;

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTicketText.trim() }),
        credentials: 'include'
      });
      if (response.ok) {
        setIsNewTicketModalOpen(false);
        setNewTicketText('');
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
          <div className="bg-orange-50 p-6 rounded-3xl w-fit mx-auto mb-8 rotate-3 shadow-sm">
            <MessageSquare className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#001f3f] mb-4 uppercase tracking-tight italic">Sign In Required</h1>
          <p className="text-gray-400 mb-10 font-bold uppercase tracking-widest text-[10px]">Access our elite support center</p>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-[#001f3f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-xl active:scale-95"
            >
              Sign In Now
            </button>
            <a 
              href="https://t.me/PeakLogisticsPartners" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#0088cc] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#0077b5] transition-all shadow-xl active:scale-95"
            >
              <Send className="w-5 h-5" />
              Telegram Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Mobile Header */}
      <nav className="md:hidden bg-[#001f3f] text-white px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-3">
          {selectedTicket ? (
            <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-sm font-black uppercase tracking-tighter italic">Support <span className="text-orange-500">Center</span></h1>
        </div>
        <button 
          onClick={() => setIsNewTicketModalOpen(true)}
          className="bg-orange-500 text-white p-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl"
        >
          <Plus className="w-4 h-4" />
        </button>
      </nav>

      {/* Desktop Header */}
      <nav className="hidden md:flex bg-[#001f3f] text-white px-8 py-6 items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Peak <span className="text-orange-500">Support</span></h1>
        </div>
        <button 
          onClick={() => setIsNewTicketModalOpen(true)}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Ticket List Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-100 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-sm
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${selectedTicket ? 'hidden md:block' : 'block'}
        `}>
          <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your Active Tickets</h2>
          </div>
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="divide-y divide-gray-50 overflow-y-auto h-[calc(100%-150px)] pb-20">
              {tickets.map((ticket) => (
                <button 
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-6 md:p-8 text-left hover:bg-gray-50 transition-all flex flex-col gap-3 group ${
                    selectedTicket?.id === ticket.id ? 'bg-orange-50/50 border-r-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      ticket.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {format(new Date(ticket.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <p className="font-black text-[#001f3f] truncate w-full uppercase tracking-tight italic group-hover:text-orange-500 transition-colors">
                    {ticket.messages[0]?.text}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <MessageSquare className="w-8 h-8" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No tickets active</p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-50">
            <a 
              href="https://t.me/PeakLogisticsPartners" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#0088cc] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-[#0077b5] transition-all shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
              Telegram Support Grid
            </a>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${!selectedTicket && 'hidden md:flex'}`}>
          {selectedTicket ? (
            <>
              <div className="p-4 md:p-8 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="bg-[#001f3f] p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl rotate-3">
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-[#001f3f] uppercase tracking-tight italic text-lg md:text-xl">Ticket #{selectedTicket.id?.slice(-6) || '......'}</h3>
                      <div className="hidden sm:flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Live Agent</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-1">Status: {selectedTicket.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 pb-24 md:pb-10">
                {selectedTicket.messages.map((msg, i) => {
                  const isMe = msg.sender === 'Customer';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl relative ${
                        isMe 
                          ? 'bg-orange-500 text-white rounded-tr-none' 
                          : 'bg-[#001f3f] text-white rounded-tl-none'
                      }`}>
                        <p className="font-bold leading-relaxed text-base md:text-lg italic">{msg.text}</p>
                        <span className={`text-[10px] font-black mt-4 block uppercase tracking-widest ${
                          isMe ? 'text-orange-100' : 'text-gray-400'
                        }`}>
                          {format(new Date(msg.timestamp), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 md:p-10 bg-white border-t border-gray-100 shadow-2xl sticky bottom-0">
                <form onSubmit={handleSendMessage} className="flex gap-3 md:gap-6">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-6 md:px-10 py-4 md:py-6 bg-gray-50 rounded-xl md:rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all text-sm md:text-base"
                  />
                  <button 
                    type="submit"
                    className="bg-[#001f3f] text-white px-6 md:px-12 py-4 md:py-6 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-orange-500 transition-all shadow-xl flex items-center gap-2 md:gap-3 active:scale-95"
                  >
                    <Send className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl mb-10 rotate-3">
                <MessageSquare className="w-16 h-16 md:w-20 md:h-20 text-orange-500" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-4">Support <span className="text-orange-500">Center</span></h2>
              <p className="text-gray-400 max-w-sm font-bold uppercase tracking-widest text-[10px] mb-10">Select an existing ticket or create a new one for immediate assistance</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsNewTicketModalOpen(true)}
                  className="bg-[#001f3f] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all shadow-xl active:scale-95"
                >
                  Create New Ticket
                </button>
                <a 
                  href="https://t.me/PeakLogisticsPartners" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#0088cc] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#0077b5] transition-all shadow-xl active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Live Telegram Support
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTicketModalOpen(false)}
              className="absolute inset-0 bg-[#001f3f]/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative bg-white w-full h-full md:h-auto md:max-w-xl md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 md:p-10 bg-[#001f3f] text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">New Ticket</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Describe your issue for our elite team</p>
                  </div>
                  <button onClick={() => setIsNewTicketModalOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-xl">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreateTicket} className="p-8 md:p-10 flex-1 flex flex-col justify-between md:block space-y-8">
                <div className="space-y-3 flex-1 md:flex-none">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Your Message</label>
                  <textarea 
                    required
                    value={newTicketText}
                    onChange={(e) => setNewTicketText(e.target.value)}
                    placeholder="How can we help you today?"
                    className="w-full px-6 md:px-8 py-4 md:py-6 bg-gray-50 rounded-2xl md:rounded-3xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-[#001f3f] border border-transparent focus:border-orange-500/20 transition-all min-h-[200px] md:min-h-[200px] resize-none flex-1 md:flex-none"
                  />
                </div>
                <div className="pt-4 flex gap-4 md:gap-6 sticky bottom-0 bg-white pb-4 md:pb-0">
                  <button 
                    type="button"
                    onClick={() => setIsNewTicketModalOpen(false)}
                    className="flex-1 py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-gray-50 transition-all border border-gray-100 md:border-none"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-orange-500 text-white py-5 md:py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl active:scale-95"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
