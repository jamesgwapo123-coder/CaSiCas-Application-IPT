import { useRef, useEffect, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { createRoot } from 'react-dom/client';
import { categoryIconMap, Package } from './Icons';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const CEBU_CENTER = [123.8854, 10.3157];

const MAP_STYLES = [
    { id: 'streets', label: 'Streets', style: 'mapbox://styles/mapbox/streets-v12' },
    { id: 'light', label: 'Light', style: 'mapbox://styles/mapbox/light-v11' },
    { id: 'dark', label: 'Dark', style: 'mapbox://styles/mapbox/dark-v11' },
    { id: 'satellite', label: 'Satellite', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { id: 'outdoors', label: '3D Terrain', style: 'mapbox://styles/mapbox/outdoors-v12' },
];

function renderIconToString(IconComponent, color = '#fff', size = 16) {
    const container = document.createElement('div');
    const root = createRoot(container);
    root.render(<IconComponent size={size} color={color} strokeWidth={2} />);
    const svg = container.innerHTML;
    root.unmount();
    return svg;
}

const MARKER_SIZE = 14;

export default function MapView({ listings = [], onMarkerClick, radiusKm, centerCoords }) {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const popupsRef = useRef([]);
    const [activeStyle, setActiveStyle] = useState('light');
    const [showStyles, setShowStyles] = useState(false);

    // Initialize map
    useEffect(() => {
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAP_STYLES.find((s) => s.id === activeStyle)?.style || MAP_STYLES[1].style,
            center: CEBU_CENTER,
            zoom: 12,
            minZoom: 10,
            maxZoom: 18,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
            }),
            'top-right'
        );

        mapRef.current = map;
        return () => map.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Change style
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const styleObj = MAP_STYLES.find((s) => s.id === activeStyle);
        if (styleObj) {
            map.setStyle(styleObj.style);
            // Re-add radius circle + enable terrain after style loads
            map.once('style.load', () => {
                updateRadiusCircle();
                if (activeStyle === 'outdoors') {
                    map.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                        tileSize: 512,
                        maxzoom: 14,
                    });
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStyle]);

    // Draw radius circle
    const updateRadiusCircle = useCallback(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        const center = centerCoords || CEBU_CENTER;
        const km = radiusKm;

        if (map.getSource('radius-circle')) {
            map.removeLayer('radius-circle-fill');
            map.removeLayer('radius-circle-stroke');
            map.removeSource('radius-circle');
        }

        if (!km || km <= 0) return;

        const points = 64;
        const coords = [];
        const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
        const distanceY = km / 110.574;

        for (let i = 0; i < points; i++) {
            const theta = (i / points) * (2 * Math.PI);
            coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
        }
        coords.push(coords[0]);

        map.addSource('radius-circle', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } },
        });

        map.addLayer({
            id: 'radius-circle-fill', type: 'fill', source: 'radius-circle',
            paint: { 'fill-color': '#000', 'fill-opacity': 0.05 },
        });
        map.addLayer({
            id: 'radius-circle-stroke', type: 'line', source: 'radius-circle',
            paint: { 'line-color': '#000', 'line-width': 2, 'line-dasharray': [3, 2] },
        });
    }, [radiusKm, centerCoords]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (map.isStyleLoaded()) updateRadiusCircle();
        else map.on('load', updateRadiusCircle);
    }, [updateRadiusCircle]);

    // Update markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Clear old
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        popupsRef.current.forEach((p) => p.remove());
        popupsRef.current = [];

        listings.forEach((listing) => {
            const isSell = listing.listing_type === 'sell';

            // Truncate title for label (max 20 chars)
            const labelText = listing.title.length > 20 ? listing.title.slice(0, 18) + '…' : listing.title;

            // Wrapper sized to dot with overflow:visible for label
            const el = document.createElement('div');
            el.style.cssText = `
                width: ${MARKER_SIZE}px;
                height: ${MARKER_SIZE}px;
                position: relative;
                overflow: visible;
                cursor: pointer;
            `;

            // Label above dot
            const label = document.createElement('div');
            label.textContent = labelText;
            label.style.cssText = `
                position: absolute;
                bottom: ${MARKER_SIZE + 2}px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                font-size: 9px;
                font-weight: 600;
                font-family: 'Inter', sans-serif;
                color: #333;
                background: rgba(255,255,255,0.92);
                padding: 1px 5px;
                border-radius: 3px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                pointer-events: none;
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            el.appendChild(label);

            // Dot
            const dot = document.createElement('div');
            dot.style.cssText = `
                width: ${MARKER_SIZE}px;
                height: ${MARKER_SIZE}px;
                background: ${isSell ? '#0a0a0a' : '#ffffff'};
                border: 2px solid #0a0a0a;
                border-radius: 50%;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            `;
            el.appendChild(dot);

            // Popup
            const imgSrc = listing.image || listing.image_url;
            const imgHTML = imgSrc
                ? `<img src="${imgSrc}" alt="" style="width:100%;height:110px;object-fit:cover;display:block;" />`
                : `<div style="width:100%;height:70px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#ccc;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                   </div>`;

            const popup = new mapboxgl.Popup({
                offset: [0, -(MARKER_SIZE / 2 + 4)],
                closeButton: false,
                closeOnClick: false,
                maxWidth: '200px',
                className: 'map-hover-popup',
            }).setHTML(`
                ${imgHTML}
                <div style="padding:8px;">
                  <div style="font-weight:700;font-size:12px;line-height:1.3;margin-bottom:3px;">${listing.title}</div>
                  <div style="font-weight:800;font-size:15px;margin-bottom:4px;">₱${Number(listing.price).toLocaleString()}</div>
                  <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">${listing.category_display || listing.category} · ${isSell ? 'Sale' : 'Buy'}</div>
                  <div style="margin-top:6px;font-size:10px;font-weight:600;color:#0a0a0a;text-transform:uppercase;letter-spacing:0.06em;">View Details →</div>
                </div>
            `);

            popupsRef.current.push(popup);

            el.addEventListener('mouseenter', () => {
                dot.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
                popup.setLngLat([listing.longitude, listing.latitude]).addTo(map);
            });
            el.addEventListener('mouseleave', () => {
                dot.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
                popup.remove();
            });

            const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
                .setLngLat([listing.longitude, listing.latitude])
                .addTo(map);

            el.addEventListener('click', () => {
                if (onMarkerClick) onMarkerClick(listing);
            });

            markersRef.current.push(marker);
        });
    }, [listings, onMarkerClick]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Map Style Switcher */}
            <div className="map-style-switcher">
                <button
                    className="map-style-toggle"
                    onClick={() => setShowStyles(!showStyles)}
                    title="Change map style"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                        <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                </button>
                {showStyles && (
                    <div className="map-style-options">
                        {MAP_STYLES.map((s) => (
                            <button
                                key={s.id}
                                className={`map-style-option ${activeStyle === s.id ? 'active' : ''}`}
                                onClick={() => { setActiveStyle(s.id); setShowStyles(false); }}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
