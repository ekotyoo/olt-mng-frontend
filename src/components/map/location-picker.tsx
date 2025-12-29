"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix Leaflet icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} icon={icon} /> : null;
}

export default function LocationPicker({ 
    value, 
    onChange 
}: { 
    value?: { lat: number, lng: number }, 
    onChange: (lat: number, lng: number) => void 
}) {
    const [position, setPosition] = useState<[number, number] | null>(value ? [value.lat, value.lng] : null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSetPosition = (pos: [number, number]) => {
        setPosition(pos);
        onChange(pos[0], pos[1]);
    };

    if (!mounted) return <div className="h-[200px] bg-slate-100 animate-pulse rounded-md" />;

    return (
        <div className="h-[200px] w-full rounded-md overflow-hidden border">
            <MapContainer 
                center={position || [-6.2088, 106.8456]} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={handleSetPosition} />
            </MapContainer>
        </div>
    );
}
