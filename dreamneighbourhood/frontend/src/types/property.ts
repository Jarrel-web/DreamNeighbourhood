export type Property = {
    address: string;
    id: number;                 // derived stable id
    month: string;
    town: string;
    flat_type: string;
    block: string;
    street_name: string;
    storey_range: string;
    floor_area_sqm: number;
    flat_model: string;
    lease_commence_date?: number;
    remaining_lease: string;
    resale_price: number;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    isInitiallyFavourite?: boolean;
    address_line: string;
    description?: string;
};
  