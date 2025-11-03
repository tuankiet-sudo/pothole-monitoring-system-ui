import { useEffect, useRef } from 'react';
import type { Pothole } from './PotholeData';

interface MapViewProps {
  potholes: Pothole[];
  selectedPothole: Pothole | null;
  onPotholeClick: (pothole: Pothole) => void;
}

export function MapView({ potholes, selectedPothole, onPotholeClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on the potholes
        const map = L.map(mapRef.current).setView([40.7580, -73.9855], 14);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add markers for each pothole
        potholes.forEach((pothole) => {
          // Calculate radius based on severity (1-10 scale)
          const radius = 10 + (pothole.severity * 3);
          
          // Create a circle marker
          const marker = L.circleMarker([pothole.position.lat, pothole.position.lng], {
            radius: radius,
            fillColor: '#ef4444',
            color: '#dc2626',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
          });

          marker.on('click', () => {
            onPotholeClick(pothole);
          });

          marker.addTo(map);
          markersRef.current.push({ id: pothole.id, marker });
        });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [potholes, onPotholeClick]);

  // Highlight selected pothole
  useEffect(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(({ id, marker }) => {
        const isSelected = selectedPothole?.id === id;
        marker.setStyle({
          fillColor: isSelected ? '#fbbf24' : '#ef4444',
          color: isSelected ? '#f59e0b' : '#dc2626',
          weight: isSelected ? 3 : 2,
          opacity: isSelected ? 1 : 0.8,
          fillOpacity: isSelected ? 0.8 : 0.6
        });
      });
    }
  }, [selectedPothole]);

  return <div ref={mapRef} className="w-full h-full" />;
}
