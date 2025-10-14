import Papa from "papaparse";
import type { Property } from "../types/property";

function roomsFromFlatType(ft: string): number {
  const m = ft?.match(/^(\d)\s*ROOM/i);
  if (m) return Number(m[1]);
  if (/EXECUTIVE/i.test(ft)) return 5;
  return 0;
}

export async function loadFlatsFromCsv(): Promise<Property[]> {
  const res = await fetch("/data/resale_flats_with_geocode.csv");
  if (!res.ok) throw new Error("Failed to fetch CSV");

  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    dynamicTyping: true,     // turns fields w numbers into numbers
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    console.warn("CSV parse warnings:", parsed.errors);
  }

  const rows = (parsed.data as any[]).map((r) => {
    const p: Property = {
      id: `${r.postal_code}-${r.storey_range}`,
      month: String(r.month || ""),
      town: String(r.town || ""),
      flat_type: String(r.flat_type || ""),
      block: String(r.block || ""),
      street_name: String(r.street_name || ""),
      storey_range: String(r.storey_range || ""),
      floor_area_sqm: Number(r.floor_area_sqm || 0),
      flat_model: String(r.flat_model || ""),
      lease_commence_date: r.lease_commence_date ? Number(r.lease_commence_date) : undefined,
      remaining_lease: String(r.remaining_lease || ""),
      resale_price: Number(r.resale_price || 0),
      postal_code: String(r.postal_code || ""),
      latitude: r.latitude ? Number(r.latitude) : undefined,
      longitude: r.longitude ? Number(r.longitude) : undefined,
      rooms: roomsFromFlatType(String(r.flat_type || "")),
      address_line: `Blk ${r.block} ${r.street_name}`.trim(),
    };
    return p;
  });

  return rows;
}
