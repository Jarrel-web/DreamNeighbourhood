import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "@/services/propertiesService";
import type { Property } from "@/types/property";

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(id);
        setProperty(data);
        setIframeKey(prev => prev + 1);
      } catch (err: any) {
        setError(err.message || "Failed to fetch property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] pt-20">
        <p className="text-gray-600 text-lg">Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] pt-20">
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!property) return null;

  const oneMapUrl = `https://www.onemap.gov.sg/amm/amm.html?` +
    `marker=latLng:${property.latitude},${property.longitude}` +
    `&zoom=17` +
    `&mapType=Hybrid`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 items-stretch">
            
            {/* Property Details Card */}
            <div className="flex justify-center xl:justify-end">
              <div className="w-full max-w-xl xl:max-w-2xl bg-white rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col">
                <div className="space-y-8 flex-1">
                  {/* Header Section */}
                  <div className="text-center xl:text-left">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                      Blk {property.block} {property.street_name}
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 mt-3">
                      {property.town}
                    </p>
                  </div>

                  {/* Property Type Info */}
                  <div className="text-center xl:text-left">
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                      {property.flat_type} • {property.floor_area_sqm} sqm<br/>
                      {property.storey_range} Floor • {property.flat_model}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 text-base sm:text-lg lg:text-xl">
                    <div className="flex justify-between items-center border-b-2 pb-3">
                      <span className="font-semibold text-gray-800">Lease Remaining:</span>
                      <span className="text-gray-700">{property.remaining_lease}</span>
                    </div>
                    <div className="flex justify-between items-center border-b-2 pb-3">
                      <span className="font-semibold text-gray-800">Postal Code:</span>
                      <span className="text-gray-700">{property.postal_code}</span>
                    </div>
                    
                    {/* RESALE PRICE - BIGGER AND BOLDER */}
                    <div className="flex justify-between items-center border-b-2 pb-3">
                      <span className="font-bold text-gray-900 text-lg sm:text-xl">Resale Price:</span>
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight">
                        SGD {property.resale_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {property.description && (
                    <div className="pt-6 border-t-2 flex-1">
                      <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                        {property.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map Section - Same height as card */}
            <div className="flex justify-center xl:justify-start">
              <div className="w-full max-w-xl xl:max-w-2xl bg-white rounded-2xl p-8 shadow-xl flex flex-col">
                <div 
                  className="w-full rounded-xl overflow-hidden flex-1"
                  style={{ minHeight: '400px' }}
                >
                  <iframe
                    key={iframeKey}
                    title={`Property Location - ${property.block} ${property.street_name}`}
                    src={oneMapUrl}
                    width="100%"
                    height="100%"
                    loading="eager"
                    className="border-none"
                    allowFullScreen
                  />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Interactive map powered by OneMap Singapore
                  </p>
                  <a 
                    href={oneMapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline font-medium"
                  >
                    Open map in new tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;