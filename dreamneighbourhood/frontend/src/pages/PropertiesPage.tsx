import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPropertyById } from "@/services/propertiesService";
import type { Property, ScoredAmenity } from "@/types/property";
import { ArrowLeft } from "lucide-react";
import PropertyMap from "@/components/PropertyMap";

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the property from navigation state or fetch it
  const currentProperty = location.state?.property || property;

  useEffect(() => {
    if (location.state?.property) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (!id) return;
      const data = await getPropertyById(id);
      setProperty(data);
      setLoading(false);
    };

    fetchData();
  }, [id, location.state]);

  if (loading) return <div className="text-center pt-20">Loading...</div>;
  if (!currentProperty) return <div className="text-center pt-20">Property not found</div>;

  // Get amenities if available
  const amenities = currentProperty.amenityScores 
    ? Object.values(currentProperty.amenityScores).map((s: any) => s.amenity).filter(Boolean)
    : [];
  console.log("amenities:", amenities);
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow p-6 grid md:grid-cols-2 gap-8 h-[calc(100vh-10rem)]">
        
        {/* Left side - Property Info */}
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Blk {currentProperty.block} {currentProperty.street_name}</h1>
            <p className="text-gray-600">{currentProperty.town}</p>
            
            <div className="my-4">
              <p>{currentProperty.flat_type} • {currentProperty.floor_area_sqm} sqm</p>
              <p>{currentProperty.storey_range} • {currentProperty.flat_model}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Lease:</span>
                <span>{currentProperty.remaining_lease}</span>
              </div>
              <div className="flex justify-between">
                <span>Postal:</span>
                <span>{currentProperty.postal_code}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4">
                <span>Price:</span>
                <span>SGD {currentProperty.resale_price.toLocaleString()}</span>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Nearby Amenities</h3>
                <ul className="space-y-1">
                  {amenities.map((a: ScoredAmenity, i) => (
                    <li key={i}>{a.name} - {Math.round(a.distance)}m</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Map */}
        <div className="h-full min-h-96">
          <PropertyMap
            latitude={currentProperty.latitude}
            longitude={currentProperty.longitude}
            amenities={amenities}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;