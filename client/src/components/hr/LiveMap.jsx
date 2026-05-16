import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Scan, Signal, Navigation, History, X } from 'lucide-react';
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

// Component to handle map centering and bounds
function FitBounds({ markers, selectedPath }) {
    const map = useMap();
    useEffect(() => {
        if (selectedPath && selectedPath.length > 0) {
            const bounds = L.latLngBounds(selectedPath);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
        }
    }, [markers, selectedPath, map]);
    return null;
}

export default function LiveMap({ socket, staff }) {
  const [activeDots, setActiveDots] = useState({}); // { staff_id: { lat, lng, time } }
  const [selectedStaffRoute, setSelectedStaffRoute] = useState(null); // { staff_id, name, path: [[lat, lng]] }
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    // Initialize dots from staff who have location data
    const initialDots = {};
    if (Array.isArray(staff)) {
        staff.forEach(s => {
            const lat = parseFloat(s.current_lat);
            const lng = parseFloat(s.current_lng);
            if (s && s.staff_id && !isNaN(lat) && !isNaN(lng)) {
                const id = String(s.staff_id);
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

    if (!socket) return;

    socket.on('live-location', (data) => {
      if (!data || !data.staff_id) return;
      const id = String(data.staff_id);
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
          setActiveDots(prev => ({
            ...prev,
            [id]: { 
                ...data, 
                staff_id: id,
                latitude: lat,
                longitude: lng
            }
          }));
      }
    });

    return () => socket.off('live-location');
  }, [socket, staff]);

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

  const centerPosition = [10.7672, 79.6421]; // Default to Thiruvarur/Tamil Nadu area

  return (
    <div className="glass-card !p-0 overflow-hidden shadow-2xl border border-white/5 h-[700px] flex flex-col relative">
      
      {/* Header */}
      <div className="z-[1000] p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <MapIcon className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-outfit font-black uppercase tracking-tighter text-xl">Live Geospatial Tracking</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Interactive Satellite Grid</p>
          </div>
        </div>
        
        {selectedStaffRoute && (
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl"
            >
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase text-cyan-400">Viewing Route: {selectedStaffRoute.name}</span>
                </div>
                <button 
                    onClick={() => setSelectedStaffRoute(null)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-slate-400" />
                </button>
            </motion.div>
        )}

        {!selectedStaffRoute && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Search</span>
            </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-10">
        <MapContainer center={centerPosition} zoom={13} style={{ height: '100%', width: '100%', background: '#020617' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {Object.values(activeDots).map((dot) => (
                <Marker 
                    key={dot.staff_id} 
                    position={[dot.latitude, dot.longitude]}
                >
                    <Popup className="premium-popup">
                        <div className="p-2 min-w-[150px]">
                            <p className="text-sm font-black uppercase text-slate-800">{dot.name || dot.staff_id}</p>
                            <p className="text-[10px] text-slate-500 font-bold mb-3">LAST ACTIVE: {new Date(dot.timestamp).toLocaleTimeString()}</p>
                            
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
            ))}

            {selectedStaffRoute && (
                <Polyline 
                    positions={selectedStaffRoute.path} 
                    pathOptions={{ color: '#06b6d4', weight: 4, opacity: 0.8, dashArray: '10, 10' }} 
                />
            )}

            {/* Automatically adjust view to show all markers or the selected route */}
            <FitBounds 
                markers={Object.values(activeDots)} 
                selectedPath={selectedStaffRoute?.path} 
            />
        </MapContainer>

        {/* CSS for custom popup styling */}
        <style dangerouslySetInnerHTML={{ __html: `
            .premium-popup .leaflet-popup-content-wrapper {
                background: white;
                border-radius: 12px;
                padding: 0;
            }
            .premium-popup .leaflet-popup-content {
                margin: 0;
            }
            .leaflet-container {
                font-family: inherit;
            }
        `}} />
      </div>

      {/* Footer / Active List */}
      <div className="z-[1000] p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md flex justify-between items-center overflow-x-auto gap-4">
        <div className="flex gap-4">
           {Object.values(activeDots).map(dot => (
             <button 
                key={dot.staff_id} 
                onClick={() => fetchRoute(dot.staff_id, dot.name)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-cyan-500/50 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
             >
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_#06b6d4]" />
                <span className="text-[10px] font-bold text-slate-300">{dot.name || dot.staff_id}</span>
             </button>
           ))}
        </div>
        {Object.keys(activeDots).length === 0 && (
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No active signals detected</p>
        )}
      </div>
    </div>
  );
}
