import React, { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ScoredAmenity } from "@/types/property";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Props {
  latitude: number;
  longitude: number;
  amenities?: ScoredAmenity[];
}

const PropertyMap: React.FC<Props> = ({ latitude, longitude, amenities }) => {
  useEffect(() => {
    console.log("📍 Map data:", { latitude, longitude, amenities });

    const map = L.map("map").setView([latitude, longitude], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Property marker
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup("<b>Property</b>")
      .openPopup();

    // Amenity markers
    if (amenities && amenities.length > 0) {
      amenities.forEach((amenity) => {
        // Handle the data mismatch - your type says 'lon' but data has 'lng'


        if (amenity.lat && amenity.lon) {
          console.log("📍 Adding amenity:", amenity.name, amenity.lat, amenity.lon);
          
          L.marker([amenity.lat, longitude])
            .addTo(map)
            .bindPopup(`<b>${amenity.name}</b><br>${Math.round(amenity.distance)}m away`);
        } else {
          console.log("❌ Amenity missing coordinates:", amenity);
        }
      });

      // Fit bounds to show all markers
      const bounds = L.latLngBounds([[latitude, longitude]]);
      amenities.forEach((amenity) => {
        const amenityLng = (amenity as any).lng || amenity.lon;
        if (amenity.lat && amenityLng) {
          bounds.extend([amenity.lat, amenityLng]);
        }
      });
      map.fitBounds(bounds.pad(0.1));
    }

    return () => {
      map.remove();
    };
  }, [latitude, longitude, amenities]);

  return <div id="map" className="w-full h-full rounded-lg" />;
};

export default PropertyMap;