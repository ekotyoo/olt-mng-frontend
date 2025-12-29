"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import L from "leaflet";

interface Location {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    status: string;
}

export default function ActiveNetworkMap({ locations }: { locations: Location[] }) {
    // Default to a central point (e.g., Jakarta) if no locations
    const defaultCenter: [number, number] = locations.length > 0 
        ? [locations[0].lat, locations[0].lng] 
        : [-6.2088, 106.8456];

    const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        // Fix Leaflet icons (Next.js/Webpack issue)
        const icon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        setCustomIcon(icon);
    }, []);

    // If icon not ready, render minimal placeholder or nothing
    if (!customIcon) return <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-lg" />;

    return (
        <Card className="overflow-hidden border-0 shadow-lg h-[600px]">
            <MapContainer 
                center={defaultCenter} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locations.map(loc => (
                    <Marker 
                        key={loc.id} 
                        position={[loc.lat, loc.lng]} 
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="flex flex-col gap-1 min-w-[200px]">
                                <h3 className="font-bold text-sm">{loc.title}</h3>
                                <div className="text-xs text-muted-foreground">{loc.description}</div>
                                <div className="mt-2">
                                    <Badge variant={loc.status === "active" ? "default" : "destructive"}>
                                        {loc.status}
                                    </Badge>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Card>
    );
}
