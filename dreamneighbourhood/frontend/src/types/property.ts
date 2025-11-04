// types/property.ts
export interface ScoredAmenity {
  name: string;
  type: string;
  distance: number;
  lat: number;
  lon: number;
  formattedAddress?: string;
  website?: string | null;
  opening_hours?: any;
}

export interface AmenityScore {
  distance: number;
  score: number;
  amenities: ScoredAmenity[];
}

export interface Property {
  id: number;
  block: string;
  street_name: string;
  town: string;
  flat_type: string;
  floor_area: number;
  storey_range: string;
  flat_model: string;
  remaining_lease: string;
  postal_code: string;
  resale_price: number;
  latitude: number;
  longitude: number;
  description?: string;
  // optional for ranked properties
  totalScore?: number;
  amenityScores?: Record<string, AmenityScore>;
}
