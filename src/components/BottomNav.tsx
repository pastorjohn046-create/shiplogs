import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, User, Globe, History, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../App';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Globe, label: 'News', path: '/news' },
    { icon: user ? History : Package, label: user ? 'Updates' : 'Track', path: user ? '/updates' : '/' },
    { icon: user ? (isAdmin ? Zap : User) : User, label: user ? (isAdmin ? 'Admin' : 'Profile') : 'Login', path: user ? (isAdmin ? '/admin' : '/profile') : '/login' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-3 z-[90] flex items-center justify-between pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/track/search' && location.pathname.startsWith('/track/'));
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path === '/track/search' ? '/' : item.path)}
            className="flex flex-col items-center gap-1 relative group"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.2 : 1,
                color: isActive ? '#f97316' : '#001f3f'
              }}
              className="p-1"
            >
              <item.icon className="w-6 h-6" />
            </motion.div>
            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-orange-500' : 'text-[#001f3f]/40'}`}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="bottomNavDot"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
