import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { User, Mail, Shield, LogOut, ArrowLeft, Settings, Bell, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      items: [
        { label: 'Email Address', value: user.email, type: 'text' },
        { label: 'Account Role', value: user.role === 'admin' ? 'ELITE ADMIN' : 'PREMIUM CUSTOMER', type: 'badge' },
        { label: 'Member Since', value: 'January 2026', type: 'text' },
      ]
    },
    {
      title: 'Preferences',
      icon: Settings,
      items: [
        { label: 'Notifications', value: 'Enabled', icon: Bell },
        { label: 'Security', value: 'MFA Verified', icon: Shield },
        { label: 'Payment Methods', value: '4 Cards Linked', icon: CreditCard },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32 md:pb-10">
      <nav className="bg-[#001f3f] text-white px-6 md:px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">Nexus <span className="text-orange-500">Identity</span></h1>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 text-red-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-6 md:p-10 space-y-10">
        {/* Profile Header */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-[#001f3f] rounded-[2.5rem] flex items-center justify-center rotate-3 shadow-2xl relative overflow-hidden">
                <User className="w-16 h-16 md:w-20 md:h-20 text-orange-500" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-orange-500 p-3 rounded-2xl shadow-xl border-4 border-white">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-2">
                {user.email.split('@')[0]}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">
                  {user.role}
                </span>
                <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                  ID: {user.uid?.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex items-center gap-4">
                <div className="bg-[#001f3f] p-3 rounded-xl">
                  <section.icon className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="font-black text-[#001f3f] uppercase tracking-tight italic text-lg">
                  {section.title}
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                        {item.label}
                      </p>
                      <p className="text-[#001f3f] font-bold text-sm">
                        {item.value}
                      </p>
                    </div>
                    {item.icon ? (
                      <item.icon className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-orange-500 transition-colors" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advanced Settings */}
        <div className="bg-[#001f3f] rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-6 relative z-10">Advanced Security</h3>
          <p className="text-gray-400 font-medium mb-8 max-w-lg relative z-10 leading-relaxed">
            Protect your elite shipping console with industry-standard encryption and multi-factor authentication.
          </p>
          <div className="flex flex-wrap gap-4 relative z-10">
            <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
              Enable 2FA
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
              Update Password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
