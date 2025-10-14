export type Property = {
    id: string;                 // derived stable id
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

    // derived fields
    rooms: number;
    address_line: string;
};
  