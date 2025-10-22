import { authHeader } from "./auth";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
export type FavouriteStatus = {
  isFavourite: boolean;
};

// Get favourite status of all property by user
export async function getAllFavourites() {
  const res = await fetch(`${API_BASE}/favourites`, {
    headers: {
      ...authHeader(),
      cache: "no-store",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch favourites");
  }

  const data = await res.json();

  // Return just the favourites array (which your context expects)
  return data.favourites; // array of favourite properties
}

// Add property to favourites
export async function addFavourite(propertyId: number) {
  const res = await fetch(`${API_BASE}/favourites/add`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ propertyId }),
  });
  if (!res.ok) throw new Error("Failed to add favourite");
  return res.json();
}

// Remove property from favourites
export async function removeFavourite(propertyId: number) {
  const res = await fetch(`${API_BASE}/favourites/${propertyId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to remove favourite");
  return res.json();
}
