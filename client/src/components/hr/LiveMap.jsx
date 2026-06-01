import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Navigation, History, X, UserCheck, UserX, ChevronRight } from 'lucide-react';
import axios from 'axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });
const TODAY = new Date().toISOString().split('T')[0];

// Custom dot icon
function dotIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2.5px solid white;
      border-radius:50%;
      box-shadow:0 0 8px ${color};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size],
  });
}

// Start/End pin icons
function pinIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `<div style="text-align:center;">
      <div style="
        background:${color};color:white;font-size:9px;font-weight:900;
        padding:2px 6px;border-radius:4px;white-space:nowrap;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">${label}</div>
      <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${color};margin:0 auto;"></div>
    </div>`,
    iconSize: [50, 28],
    iconAnchor: [25, 28],
  });
}

function FitBounds({ path, markers }) {
  const map = useMap();
  useEffect(() => {
    if (path && path.length > 1) {
      map.fitBounds(L.latLngBounds(path), { padding: [60, 60] });
    } else if (markers && markers.length > 0) {
      map.fitBounds(L.latLngBounds(markers.map(m => [m.latitude, m.longitude])), { padding: [80, 80], maxZoom: 14 });
    }
  }, [path, markers, map]);
  return null;
}

export default function LiveMap({ socket, staff, attendance }) {
  const [activeDots, setActiveDots] = useState({});
  const [movingIds, setMovingIds] = useState(new Set());
  const [selectedStaff, setSelectedStaff] = useState(null); // { staff_id, name }
  const [route, setRoute] = useState([]); // [[lat,lng], ...]
  const [loadingRoute, setLoadingRoute] = useState(false);
  const movingTimers = useRef({});

  const todayCheckedIn = new Set(
    (attendance || [])
      .filter(a => a.date === TODAY && a.check_in)
      .map(a => String(a.staff_id))
  );

  useEffect(() => {
    const initialDots = {};
    if (Array.isArray(staff)) {
      staff.forEach(s => {
        const id = String(s.staff_id);
        if (!todayCheckedIn.has(id)) return;
        const lat = parseFloat(s.current_lat);
        const lng = parseFloat(s.current_lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          initialDots[id] = { staff_id: id, name: s.name, latitude: lat, longitude: lng, timestamp: s.last_active };
        }
      });
    }
    setActiveDots(initialDots);
  }, [staff, attendance]);

  useEffect(() => {
    if (!socket) return;
    socket.on('live-location', (data) => {
      if (!data || !data.staff_id) return;
      const id = String(data.staff_id);
      if (!todayCheckedIn.has(id)) return;
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      setActiveDots(prev => ({ ...prev, [id]: { ...data, staff_id: id, latitude: lat, longitude: lng } }));
      setMovingIds(prev => new Set([...prev, id]));
      clearTimeout(movingTimers.current[id]);
      movingTimers.current[id] = setTimeout(() => {
        setMovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      }, 30000);
    });
    return () => socket.off('live-location');
  }, [socket, todayCheckedIn]);

  // Auto-fetch route when a staff is selected
  const selectStaff = async (staff_id, name) => {
    if (selectedStaff?.staff_id === staff_id) {
      setSelectedStaff(null);
      setRoute([]);
      return;
    }
    setSelectedStaff({ staff_id, name });
    setRoute([]);
    setLoadingRoute(true);
    try {
      const { data } = await api.get(`/hr/staff/route/${staff_id}`);
      if (data && data.length > 0) {
        setRoute(data.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]));
      } else {
        setRoute([]);
        alert('No travel history found for today.');
      }
    } catch (err) {
      console.error('Route fetch error:', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const dots = Object.values(activeDots);
  const centerPosition = [10.7672, 79.6421];

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border border-white/5 h-[700px] flex flex-col relative">

      {/* Header */}
      <div className="z-[1000] p-5 border-b border-white/10 flex flex-wrap gap-3 justify-between items-center bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapIcon className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-outfit font-black uppercase tracking-tighter text-xl">Live Field Tracking</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Today's check-in staff only</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{todayCheckedIn.size} Checked In</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{movingIds.size} Moving</span>
          </div>

          {selectedStaff && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-400">
                {loadingRoute ? 'Loading route...' : `Route: ${selectedStaff.name}`}
              </span>
              <button onClick={() => { setSelectedStaff(null); setRoute([]); }} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative z-10">
        <MapContainer center={centerPosition} zoom={13} style={{ height: '100%', width: '100%', background: '#020617' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            maxZoom={19}
          />

          {/* All staff markers */}
          {dots.map(dot => {
            const isMoving = movingIds.has(dot.staff_id);
            const isSelected = selectedStaff?.staff_id === dot.staff_id;
            return (
              <Marker
                key={dot.staff_id}
                position={[dot.latitude, dot.longitude]}
                icon={dotIcon(isSelected ? '#f59e0b' : isMoving ? '#10b981' : '#06b6d4', isSelected ? 18 : 14)}
                eventHandlers={{ click: () => selectStaff(dot.staff_id, dot.name) }}
              >
                <Popup className="premium-popup">
                  <div className="p-3 min-w-[180px]">
                    <p className="text-sm font-black uppercase text-slate-800 mb-1">{dot.name}</p>
                    <p className="text-[10px] text-slate-500 mb-1">ID: {dot.staff_id}</p>
                    <p className="text-[10px] mb-3">
                      Status: <span className={`font-bold ${isMoving ? 'text-emerald-600' : 'text-blue-500'}`}>
                        {isMoving ? '🟢 Moving' : '🔵 Static'}
                      </span>
                    </p>
                    <button
                      onClick={() => selectStaff(dot.staff_id, dot.name)}
                      className="w-full bg-amber-500 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <History className="w-3 h-3" />
                      {isSelected ? 'Hide Route' : 'Show Full Route'}
                    </button>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${dot.latitude},${dot.longitude}`, '_blank')}
                      className="w-full mt-2 bg-slate-100 text-slate-800 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 border border-slate-200"
                    >
                      <Navigation className="w-3 h-3" /> Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Selected staff route */}
          {route.length > 1 && (
            <>
              <Polyline
                positions={route}
                pathOptions={{ color: '#f59e0b', weight: 5, opacity: 0.9, dashArray: '10, 6' }}
              />
              {/* Start marker */}
              <Marker position={route[0]} icon={pinIcon('#10b981', '▶ START')} />
              {/* End marker */}
              <Marker position={route[route.length - 1]} icon={pinIcon('#ef4444', 'END ■')} />
            </>
          )}

          <FitBounds path={route.length > 1 ? route : null} markers={route.length === 0 ? dots : null} />
        </MapContainer>

        <style dangerouslySetInnerHTML={{ __html: `
          .premium-popup .leaflet-popup-content-wrapper { background:white; border-radius:12px; padding:0; box-shadow:0 10px 30px rgba(0,0,0,0.3); }
          .premium-popup .leaflet-popup-content { margin:0; }
          .leaflet-container { font-family:inherit; }
        `}} />
      </div>

      {/* Footer: Staff List */}
      <div className="z-[1000] p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md">
        {dots.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {dots.map(dot => {
              const isMoving = movingIds.has(dot.staff_id);
              const isSelected = selectedStaff?.staff_id === dot.staff_id;
              return (
                <button
                  key={dot.staff_id}
                  onClick={() => selectStaff(dot.staff_id, dot.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : isMoving
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-500'}`} />
                  {dot.name}
                  {isSelected && <span className="text-amber-400 uppercase ml-1">· Route</span>}
                  {!isSelected && isMoving && <span className="text-emerald-400 uppercase ml-1">· Moving</span>}
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-2">
            <UserX className="w-4 h-4 text-slate-600" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No field staff active today</p>
          </div>
        )}
      </div>
    </div>
  );
}
