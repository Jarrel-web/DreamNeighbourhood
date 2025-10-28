import { AMENITY_TYPES } from "./constants";

export type AmenityType = typeof AMENITY_TYPES[number]['id'];
export type RankedAmenity = { type: AmenityType; rank: number; maxDistance: number };