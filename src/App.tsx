import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';
import { MessageCircle, X, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import AdminDashboard from './pages/AdminDashboard';
import AdminShipment from './pages/AdminShipment';
import AdminTickets from './pages/AdminTickets';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Support from './pages/Support';
import Services from './pages/Services';
import Network from './pages/Network';
import About from './pages/About';
import Profile from './pages/Profile';
import ConsignmentHistory from './pages/ConsignmentHistory';
import News from './pages/News';
import BottomNav from './components/BottomNav';

// Context
interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Login: Invalid server response text:', text);
        throw new Error(`Invalid response (Status ${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) throw new Error(data.error || `Login failed (Status ${res.status})`);
      setUser(data);
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Login failed unexpectedly');
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Register: Invalid server response text:', text);
        throw new Error(`Invalid response (Status ${res.status}): ${text.substring(0, 150)}`);
      }

      if (!res.ok) throw new Error(data.error || `Registration failed (Status ${res.status})`);
      setUser(data);
    } catch (err: any) {
      console.error('Registration error:', err);
      throw new Error(err.message || 'Registration failed unexpectedly');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#001f3f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, isAdmin, login, register, logout }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/track/:trackingId" element={<Tracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/support" element={<Support />} />
          <Route path="/services" element={<Services />} />
          <Route path="/network" element={<Network />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/updates" element={user ? <ConsignmentHistory /> : <Navigate to="/login" />} />
          <Route path="/news" element={<News />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/shipment/:id"
            element={isAdmin ? <AdminShipment /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/tickets"
            element={isAdmin ? <AdminTickets /> : <Navigate to="/login" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <BottomNav />

        {/* Floating CS Button */}
        <div className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-[100]">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-20 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
              >
                <div className="bg-[#001f3f] p-6 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">SwiftShip <span className="text-orange-500">Support</span></h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">24/7 Live Assistance</p>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Need immediate help? Connect with our team directly on Telegram for real-time support.
                  </p>
                  <a 
                    href="https://t.me/PeakLogisticsPartners" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-blue-500 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all group"
                  >
                    <span>Official Support</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <button 
                    onClick={() => {
                      setIsChatOpen(false);
                      window.location.href = '/support';
                    }}
                    className="w-full bg-gray-50 text-[#001f3f] p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all border border-gray-100"
                  >
                    Open Support Ticket
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-all"
          >
            {isChatOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
          </motion.button>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
