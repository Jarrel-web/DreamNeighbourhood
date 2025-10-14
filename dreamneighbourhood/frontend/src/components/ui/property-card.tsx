import React from "react";
import type { Property } from "src/types/property";

function formatCurrency(n: number) {
  return n.toLocaleString("en-SG", { style: "currency", currency: "SGD", maximumFractionDigits: 0 });
}

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm flex gap-4">
      {/* image placeholder; replace with real images later */}
      <div className="w-40 h-28 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base sm:text-lg line-clamp-2">
          Blk {property.block} {property.street_name}, {property.town}
        </h3>
        <div className="mt-1 text-sm text-muted-foreground">
          {property.flat_type} • {property.floor_area_sqm} sqm • {property.storey_range}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>Model: {property.flat_model}</span>
          <span>Lease: {property.remaining_lease} ({property.lease_commence_date})</span>
          <span>Postal Code: {property.postal_code}</span>
        </div>
      </div>
      <div className="self-center text-right sm:min-w-[120px]">
        <div className="text-xl sm:text-2xl font-bold">{formatCurrency(property.resale_price)}</div>
        <div className="text-xs text-muted-foreground">{property.rooms || "?"}-Room</div>
      </div>
    </div>
  );
};

export default PropertyCard;
