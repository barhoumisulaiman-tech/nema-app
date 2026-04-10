'use client';
import { useEffect, useState, useRef } from 'react';
import { COURIERS } from '@/lib/mock-data';
import { DataService } from '@/lib/data-service';

declare const L: any;

export default function SupervisorTrackingPage() {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const pathsRef = useRef<Record<string, any>>({});
  const [activeCouriers] = useState<any[]>(COURIERS);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);

  const fetchCourierLocations = async () => {
    const locations = await DataService.getCourierLocations();
    locations.forEach(loc => {
      updateMarker(loc.courier_id, { lat: loc.lat, lng: loc.lng });
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof L !== 'undefined' && !mapRef.current) {
      mapRef.current = L.map('supervisor-ops-map', { zoomControl: false }).setView([26.2929, 44.8217], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      COURIERS.forEach(c => {
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-10 h-10 bg-[#b68a3a] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl animate-pulse">🚗</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const marker = L.marker([c.currentLat, c.currentLng], { icon }).addTo(mapRef.current);
        marker.bindPopup(`<b>${c.name}</b><br/>الحالة: ${c.availabilityStatus === 'available' ? 'متاح' : 'في مهمة'}`);
        markersRef.current[c.id] = marker;
      });
    }

    fetchCourierLocations();
    const interval = setInterval(fetchCourierLocations, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateMarker = (courierId: string, { lat, lng }: { lat: number, lng: number }) => {
     if (typeof L === 'undefined' || !mapRef.current) return;
     const marker = markersRef.current[courierId];
     if (marker) marker.setLatLng([lat, lng]);

     if (!pathsRef.current[courierId]) {
        pathsRef.current[courierId] = L.polyline([[lat, lng]], { color: '#b68a3a', weight: 3, opacity: 0.6, dashArray: '5, 10' }).addTo(mapRef.current);
     } else {
        const polyline = pathsRef.current[courierId];
        const points = polyline.getLatLngs();
        points.push([lat, lng]);
        polyline.setLatLngs(points);
     }
  };

  const zoomToCourier = (c: any) => {
    setSelectedCourier(c.id);
    if (mapRef.current && markersRef.current[c.id]) {
      const latLng = markersRef.current[c.id].getLatLng();
      mapRef.current.flyTo(latLng, 15);
      markersRef.current[c.id].openPopup();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col -m-6">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h1 className="text-xl font-black text-gray-900">🗺️ التبع والمراقبة الجغرافية</h1>
          <p className="text-xs text-gray-500">نظرة عامة على تحركات الميدان في الوقت الفعلي (وضع الرقابة)</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-100">
             <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
             نظام المراقبة نشط
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-slate-100">
           <div id="supervisor-ops-map" className="absolute inset-0 z-10 bg-[#f8fafc]" />
        </div>

        <div className="w-80 border-r border-gray-100 bg-white overflow-y-auto hidden md:block">
          <div className="p-4 bg-gray-50 font-bold text-sm text-gray-600 border-b border-gray-100">
            المناديب تحت الرقابة ({activeCouriers.length})
          </div>
          <div className="divide-y divide-gray-50">
            {activeCouriers.map(c => (
              <div key={c.id} 
                onClick={() => zoomToCourier(c)}
                className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedCourier === c.id ? 'bg-[#b68a3a]/5 border-r-4 border-[#b68a3a]' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-gray-900">{c.name}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    c.availabilityStatus === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {c.availabilityStatus === 'available' ? 'متاح' : 'مشغول'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{c.district} · {c.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
