import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Scan, Signal } from 'lucide-react';

export default function LiveMap({ socket, staff }) {
  const [activeDots, setActiveDots] = useState({}); // { staff_id: { lat, lng, time } }

  useEffect(() => {
    if (!socket) return;

    socket.on('live-location', (data) => {
      // Mocking grid placement since we don't have real map data
      // In production, we'd use Leaflet/Google Maps.
      // Here we create a visual 'Radar' grid.
      setActiveDots(prev => ({
        ...prev,
        [data.staff_id]: { 
            ...data, 
            x: Math.random() * 80 + 10, // Randomized for demo radar
            y: Math.random() * 80 + 10  // Randomized for demo radar
        }
      }));
    });

    return () => socket.off('live-location');
  }, [socket]);

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border border-white/5 h-[600px] flex flex-col relative">
      {/* Radar Background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 border-[40px] border-slate-950/80 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-cyan-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-cyan-500/10 rounded-full" />
        {/* Pulsing Scan Line */}
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 origin-top w-1 h-[250px] bg-gradient-to-b from-cyan-500 to-transparent"
        />
      </div>

      <div className="z-10 p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Scan className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-outfit font-black uppercase tracking-tighter text-xl">Live Field Tracking</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Real-time Radar Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Search</span>
        </div>
      </div>

      <div className="flex-1 relative z-10 overflow-hidden cursor-crosshair">
        <AnimatePresence>
            {Object.values(activeDots).map((dot) => {
                const s = staff.find(st => st.staff_id === dot.staff_id);
                return (
                    <motion.div
                        key={dot.staff_id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute"
                        style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                    >
                        <div className="relative group">
                            <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]" />
                            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-75" />
                            
                            {/* Hover Details */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 bg-slate-900 border border-white/10 p-2 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity shadow-2xl pointer-events-none">
                                <p className="text-[10px] font-black uppercase tracking-tighter text-white truncate">{s?.name || dot.staff_id}</p>
                                <p className="text-[8px] text-cyan-400 font-bold uppercase">Field Active</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
        
        {Object.keys(activeDots).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-slate-600">
                <Signal className="w-12 h-12 opacity-20 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest">Awaiting Remote Signals...</p>
            </div>
        )}
      </div>

      <div className="z-10 p-4 border-t border-white/10 bg-slate-900/80 backdrop-blur-md flex justify-between items-center overflow-x-auto gap-4">
        <div className="flex gap-4">
           {Object.values(activeDots).map(dot => (
             <div key={dot.staff_id} className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg whitespace-nowrap">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_#06b6d4]" />
                <span className="text-[10px] font-bold text-slate-300">{staff.find(st => st.staff_id === dot.staff_id)?.name || dot.staff_id}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
