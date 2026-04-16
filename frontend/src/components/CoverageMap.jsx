import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBD4xk3Z8B7ro6Npyuuil47gEeENuude3A';

// City coordinates for Indian gig worker cities
const CITY_COORDS = {
  mumbai:    { lat: 19.0760, lng: 72.8777 },
  delhi:     { lat: 28.6139, lng: 77.2090 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai:   { lat: 13.0827, lng: 80.2707 },
  kolkata:   { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune:      { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  gurgaon:   { lat: 28.4595, lng: 77.0266 },
  gurugram:  { lat: 28.4595, lng: 77.0266 },
  noida:     { lat: 28.5355, lng: 77.3910 },
};

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(window.google.maps); return; }
    const existing = document.getElementById('gmap-script');
    if (existing) { existing.addEventListener('load', () => resolve(window.google.maps)); return; }
    const script = document.createElement('script');
    script.id = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function CoverageMap({ city, pinCode, workerName }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const cityKey = city?.toLowerCase().trim();
  const coords = CITY_COORDS[cityKey] || CITY_COORDS['delhi'];

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;

        const map = new maps.Map(mapRef.current, {
          center: coords,
          zoom: 13,
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#EDE8F5' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#3D52A0' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ADBBDA' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#7091E6' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#8697C4' }] },
          ],
        });

        mapInstance.current = map;

        // Worker location marker
        const workerMarker = new maps.Marker({
          position: coords,
          map,
          title: `${workerName || 'Worker'} — ${city}`,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3D52A0',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        // Coverage zone circle (5km radius)
        new maps.Circle({
          strokeColor: '#7091E6',
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: '#7091E6',
          fillOpacity: 0.08,
          map,
          center: coords,
          radius: 5000,
        });

        // Info window
        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="font-family:Inter,sans-serif;padding:8px 4px;min-width:160px">
              <p style="font-weight:800;color:#3D52A0;font-size:14px;margin:0 0 4px">${workerName || 'Worker'}</p>
              <p style="color:#8697C4;font-size:12px;margin:0 0 2px">📍 ${city}${pinCode ? ` — ${pinCode}` : ''}</p>
              <p style="color:#7091E6;font-size:11px;font-weight:600;margin:0">Coverage Zone: 5km radius</p>
            </div>
          `,
        });

        workerMarker.addListener('click', () => infoWindow.open(map, workerMarker));

        setLoaded(true);
      })
      .catch(() => { if (!cancelled) setError(true); });

    return () => { cancelled = true; };
  }, [city, pinCode]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-3)' }}>
        <MapPin size={32} />
        <p className="text-sm font-semibold">Map unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(237,232,245,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col items-center gap-3">
            <Navigation size={28} style={{ color: '#7091E6' }} className="animate-pulse" />
            <p className="text-sm font-semibold" style={{ color: '#8697C4' }}>Loading map...</p>
          </div>
        </div>
      )}
      {/* City badge overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
        style={{
          background: 'rgba(61,82,160,0.9)',
          color: 'white',
          backdropFilter: 'blur(8px)',
        }}>
        <MapPin size={12} />
        {city} · Coverage Zone
      </div>
    </div>
  );
}
