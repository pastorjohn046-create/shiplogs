import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, ExternalLink, Calendar, Search, Newspaper, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

const NEWS_ARTICLES = [
  {
    id: 1,
    title: "Global Supply Chains Brace for Q3 Surge",
    category: "Market Analysis",
    date: "April 28, 2026",
    image: "https://picsum.photos/seed/cargo-1/800/600",
    summary: "Leading analysts predict a 15% increase in global shipping volumes as retail giants prepare for earlier holiday restocks amidst evolving trade routes.",
    author: "Elena Sterling",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Sustainability in Logistics: The Hydrogen Pivot",
    category: "Innovation",
    date: "April 26, 2026",
    image: "https://picsum.photos/seed/tech-1/800/600",
    summary: "As zero-emission mandates tighten, we explore the transition to hydrogen-powered cargo fleets and the infrastructure challenges ahead.",
    author: "Dr. Marcus Vane",
    readTime: "8 min read"
  },
  {
    id: 3,
    title: "Singapore Hub Expands Autonomous Operations",
    category: "Infrastructure",
    date: "April 25, 2026",
    image: "https://picsum.photos/seed/hub-1/800/600",
    summary: "The world's most connected port integrates AI-driven crane systems, reducing vessel turnaround times by a record-breaking 22%.",
    author: "Kaito Yamamoto",
    readTime: "4 min read"
  },
  {
    id: 4,
    title: "The Rise of Onshoring in North America",
    category: "Trade",
    date: "April 23, 2026",
    image: "https://picsum.photos/seed/factory-1/800/600",
    summary: "Manufacturing shift towards regional production is reshaping continental logistics networks and demand for high-speed rail freight.",
    author: "Sarah Thompson",
    readTime: "6 min read"
  }
];

export default function News() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-32 md:pb-10">
      <nav className="bg-[#001f3f] text-white px-6 md:px-8 py-6 flex items-center justify-between sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic">SwiftShip <span className="text-orange-500">Dispatch</span></h1>
        </div>
        <div className="bg-orange-500 p-2 rounded-xl shadow-lg rotate-12">
          <Globe className="w-5 h-5 text-white animate-spin-slow" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full p-6 md:p-10">
        <header className="mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Elite Intelligence Feed</h2>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h3 className="text-6xl md:text-7xl font-black text-[#001f3f] leading-[0.85] uppercase tracking-tighter italic">
              Global <br />
              <span className="text-gray-300">Perspectives</span>
            </h3>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Index Surge</p>
                  <p className="text-xs font-black text-[#001f3f]">+2.4% Vol</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Story */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] md:h-[600px] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl mb-16 group cursor-pointer"
        >
          <img src={NEWS_ARTICLES[0].image} alt="Featured" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] via-[#001f3f]/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 md:bottom-20 md:left-20 md:right-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Featured Analysis</span>
              <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{NEWS_ARTICLES[0].date}</span>
            </div>
            <h4 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-tight mb-6">
              {NEWS_ARTICLES[0].title}
            </h4>
            <p className="text-gray-300 font-medium text-lg leading-relaxed max-w-2xl mb-8 hidden md:block">
              {NEWS_ARTICLES[0].summary}
            </p>
            <button className="bg-white text-[#001f3f] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center gap-3">
              Read Full Dispatch
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Secondary News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {NEWS_ARTICLES.slice(1).map((article, idx) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group"
            >
              <div className="h-64 overflow-hidden relative">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 left-6">
                  <span className="bg-[#001f3f]/90 backdrop-blur-md text-orange-500 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{article.date}</span>
                </div>
                <h4 className="text-2xl font-black text-[#001f3f] uppercase tracking-tighter italic mb-4 leading-tight group-hover:text-orange-500 transition-colors">
                  {article.title}
                </h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                  {article.summary}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-black text-[#001f3f] text-[10px]">
                      {article.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#001f3f] uppercase tracking-widest">{article.author}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{article.readTime}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-gray-50 hover:bg-orange-500 hover:text-white rounded-xl transition-all">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Hub Connect */}
        <section className="mt-24 bg-[#001f3f] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="bg-orange-500 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 rotate-12 shadow-2xl relative z-10">
            <Zap className="w-12 h-12 text-[#001f3f]" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.85] uppercase tracking-tighter italic mb-10 relative z-10">
            Real-Time <br />
            <span className="text-orange-500">Logistics Pulse</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-12 font-medium relative z-10 leading-relaxed">
            Don't just track shipments. Track the world. Subscribe to our elite dispatch for daily operational intelligence.
          </p>
          <div className="max-w-md mx-auto flex flex-col md:flex-row gap-4 relative z-10">
            <input 
              type="email" 
              placeholder="YOUR PROFESSIONAL EMAIL" 
              className="flex-1 bg-white/10 border border-white/20 px-8 py-5 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold text-sm tracking-widest transition-all"
            />
            <button className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
              Subscribe
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
