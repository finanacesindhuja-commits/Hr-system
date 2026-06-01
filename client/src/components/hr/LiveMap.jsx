import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Map as MapIcon, Navigation, History, X, Radio, UserCheck, UserX } from 'lucide-react';
import axios from 'axios';

// Fix Leaflet marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });
const TODAY = new Date().toISOString().split('T')[0];

// Custom marker icon generator - green for moving, cyan for static
function createIcon(color, isMoving) {
  const pulse = isMoving ? `
    <div style="
      position:absolute; top:-4px; left:-4px;
      width:24px; height:24px;
      background:${color}33;
      border-radius:50%;
      animation: ping 1.2s ease-out infinite;
    "></div>` : '';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:16px; height:16px;">
        ${pulse}
        <div style="
          width:16px; height:16px;
          background:${color};
          border: 2px solid white;
          border-radius:50%;
          box-shadow: 0 0 8px ${color};
        "></div>
      </div>
      <style>
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
}

function FitBounds({ markers, selectedPath }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPath && selectedPath.length > 1) {
      map.fitBounds(L.latLngBounds(selectedPath), { padding: [50, 50] });
    } else if (markers && markers.length > 0) {
      map.fitBounds(L.latLngBounds(markers.map(m => [m.latitude, m.longitude])), { padding: [80, 80], maxZoom: 15 });
    }
  }, [markers, selectedPath, map]);
  return null;
}

export default function LiveMap({ socket, staff, attendance }) {
  const [activeDots, setActiveDots] = useState({});
  const [movingIds, setMovingIds] = useState(new Set()); // staff_ids who moved in last 30s
  const [selectedStaffRoute, setSelectedStaffRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const movingTimers = useRef({});

  // Today's checked-in staff IDs
  const todayCheckedIn = new Set(
    (attendance || [])
      .filter(a => a.date === TODAY && a.check_in)
      .map(a => String(a.staff_id))
  );

  useEffect(() => {
    // Initialize dots ONLY for today's checked-in staff with location data
    const initialDots = {};
    if (Array.isArray(staff)) {
      staff.forEach(s => {
        const id = String(s.staff_id);
        if (!todayCheckedIn.has(id)) return; // skip if not checked in today
        const lat = parseFloat(s.current_lat);
        const lng = parseFloat(s.current_lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          initialDots[id] = {
            staff_id: id,
            name: s.name,
            latitude: lat,
            longitude: lng,
            timestamp: s.last_active
          };
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
      if (!todayCheckedIn.has(id)) return; // only track today's attendees

      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      setActiveDots(prev => ({
        ...prev,
        [id]: { ...data, staff_id: id, latitude: lat, longitude: lng }
      }));

      // Mark as moving
      setMovingIds(prev => new Set([...prev, id]));
      clearTimeout(movingTimers.current[id]);
      movingTimers.current[id] = setTimeout(() => {
        setMovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      }, 30000); // remove "moving" badge after 30s of no updates
    });
    return () => socket.off('live-location');
  }, [socket, todayCheckedIn]);

  const fetchRoute = async (staff_id, name) => {
    setLoadingRoute(true);
    try {
      const { data } = await api.get(`/hr/staff/route/${staff_id}`);
      if (data && data.length > 0) {
        const path = data.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]);
        setSelectedStaffRoute({ staff_id, name, path });
      } else {
        alert('No travel history found for today.');
      }
    } catch (err) {
      console.error('Failed to fetch route:', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const dots = Object.values(activeDots);
  const movingDots = dots.filter(d => movingIds.has(d.staff_id));
  const centerPosition = [10.7672, 79.6421];

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border border-white/5 h-[700px] flex flex-col relative">

      {/* Header */}
      <div className="z-[1000] p-5 border-b border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapIcon className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-outfit font-black uppercase tracking-tighter text-xl">Live Field Tracking</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Today's Check-in Staff Only</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{todayCheckedIn.size} Checked In</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{movingDots.length} Moving</span>
          </div>

          {/* Route view label */}
          {selectedStaffRoute && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase text-amber-400">Route: {selectedStaffRoute.name}</span>
              <button onClick={() => setSelectedStaffRoute(null)} className="p-1 hover:bg-white/10 rounded-full">
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
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />

          {dots.map(dot => {
            const isMoving = movingIds.has(dot.staff_id);
            return (
              <Marker
                key={dot.staff_id}
                position={[dot.latitude, dot.longitude]}
                icon={createIcon(isMoving ? '#10b981' : '#06b6d4', isMoving)}
              >
                <Popup className="premium-popup">
                  <div className="p-3 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-400'}`} />
                      <p className="text-sm font-black uppercase text-slate-800">{dot.name || dot.staff_id}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold mb-1">ID: {dot.staff_id}</p>
                    <p className="text-[10px] text-slate-400 mb-1">
                      Status: <span className={`font-bold ${isMoving ? 'text-emerald-600' : 'text-blue-500'}`}>
                        {isMoving ? '🟢 Moving' : '🔵 Static'}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 mb-3">
                      Last seen: {dot.timestamp ? new Date(dot.timestamp).toLocaleTimeString() : 'N/A'}
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => fetchRoute(dot.staff_id, dot.name)}
                        disabled={loadingRoute}
                        className="w-full bg-cyan-600 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <History className="w-3 h-3" /> {loadingRoute ? 'Loading...' : 'View Today Route'}
                      </button>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${dot.latitude},${dot.longitude}`, '_blank')}
                        className="w-full bg-slate-100 text-slate-800 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 border border-slate-200"
                      >
                        <Navigation className="w-3 h-3" /> Open in Google Maps
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route Polyline */}
          {selectedStaffRoute && (
            <Polyline
              positions={selectedStaffRoute.path}
              pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.9, dashArray: '8, 6' }}
            />
          )}

          <FitBounds markers={dots} selectedPath={selectedStaffRoute?.path} />
        </MapContainer>

        <style dangerouslySetInnerHTML={{ __html: `
          .premium-popup .leaflet-popup-content-wrapper {
            background: white; border-radius: 12px; padding: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .premium-popup .leaflet-popup-content { margin: 0; }
          .leaflet-container { font-family: inherit; }
        `}} />
      </div>

      {/* Footer - Active Staff List */}
      <div className="z-[1000] p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md overflow-x-auto">
        {dots.length > 0 ? (
          <div className="flex gap-3 flex-wrap">
            {dots.map(dot => {
              const isMoving = movingIds.has(dot.staff_id);
              return (
                <button
                  key={dot.staff_id}
                  onClick={() => fetchRoute(dot.staff_id, dot.name)}
                  className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-[10px] font-bold ${
                    isMoving
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-cyan-500/50'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isMoving ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-500'}`} />
                  {dot.name || dot.staff_id}
                  {isMoving && <span className="text-emerald-400 uppercase tracking-widest">· Moving</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-2">
            <UserX className="w-4 h-4 text-slate-600" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              No field staff active today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
