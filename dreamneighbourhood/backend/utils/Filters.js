

// Function to calc distance between coordinates to use for property distance filtering
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dist_Lat = (lat2 - lat1) * (Math.PI / 180);
    const dist_Lon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dist_Lat / 2) * Math.sin(dist_Lat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * 
        Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dist_Lon / 2) * 
        Math.sin(dist_Lon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

// Function to create boundaries for oneMap Theme searching
export const findBoundary = (lat, lon, distanceKm) => {
    const latOffset = distanceKm / 111.32; 
    const LonOffset = distanceKm / (111.32 * Math.cos(lat * (Math.PI / 180))); 

    return `${lat - latOffset},${lon - LonOffset},${lat + latOffset},${lon + LonOffset}`;
};


