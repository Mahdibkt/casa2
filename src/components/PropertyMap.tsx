import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Property } from "@/lib/types";
import { formatPrice } from "@/lib/mock-data";

const icon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.42 0.15 245);color:white;padding:6px 10px;border-radius:9999px;font-size:12px;font-weight:600;box-shadow:0 4px 14px rgba(0,0,0,.25);white-space:nowrap;">●</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function PropertyMap({
  properties,
  height = "100%",
}: {
  properties: Property[];
  height?: string;
}) {
  // ✅ Utilise latitude/longitude (colonnes Supabase)
  const center: [number, number] = properties.length
    ? [properties[0].latitude ?? 36.8, properties[0].longitude ?? 10.18]
    : [36.8, 10.18];

  useEffect(() => {
    /* ensure CSS loaded via styles.css */
  }, []);

  return (
    <div
      className="h-full w-full overflow-hidden rounded-2xl border border-border"
      style={{ height }}
    >
      <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties
          .filter((p) => p.latitude && p.longitude) // ✅ On ignore les biens sans coordonnées
          .map((p) => (
            <Marker key={p.id} position={[p.latitude!, p.longitude!]} icon={icon}>
              <Popup>
                <div className="w-48">
                  {/* ✅ image_url au lieu de images[0] */}
                  <img
                    src={p.image_url ?? ""}
                    alt={p.titre}
                    className="mb-2 h-24 w-full rounded object-cover"
                  />
                  {/* ✅ titre et localisation au lieu de title et city */}
                  <div className="text-sm font-semibold">{p.titre}</div>
                  <div className="text-xs text-gray-600">{p.localisation}</div>
                  <div className="mt-1 text-sm font-bold" style={{ color: "oklch(0.42 0.15 245)" }}>
                    {formatPrice(p.prix, p.currency ?? "TND", p.type)}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
