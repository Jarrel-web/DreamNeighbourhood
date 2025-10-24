
import { pool } from "../config/db.js";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// GET default properties with pagination
export const getDefaultProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    // Get paginated data
    const { data, error } = await pool
      .from("properties")
      .select("*")
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    // Get total count for pagination info
    const { count, error: countError } = await pool
      .from("properties")
      .select("*", { count: 'exact', head: true });

    if (countError) throw countError;

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      results: data,
      total,
      page,
      pageSize,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Property ID is required" });

    const { data, error } = await pool
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Property not found" });

    res.json(data);
  } catch (err) {
    console.error("Error fetching property details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// SEARCH properties with filters and pagination
export const searchProperties = async (req, res) => {
  try {
    const {
      searchText,
      town,
      maxPrice,
      minRooms,
      minArea,
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE
    } = req.query;

    let query = pool.from("properties").select("*");

    // Apply filters
    if (searchText) {
      query = query.or(`street_name.ilike.%${searchText}%,town.ilike.%${searchText}%`);
    }

    if (town) {
      query = query.eq("town", town);
    }

    if (maxPrice) {
      query = query.lte("resale_price", parseInt(maxPrice));
    }

    if (minRooms) {
      // Extract numeric value from flat_type (e.g., "3 ROOM" -> 3)
      query = query.gte("flat_type", `${minRooms} ROOM`);
    }

    if (minArea) {
      query = query.gte("floor_area_sqm", parseInt(minArea));
    }

    // Calculate pagination
    const limit = Math.min(parseInt(pageSize), MAX_PAGE_SIZE);
    const offset = (parseInt(page) - 1) * limit;

    // Get paginated results with count
    const { data, error, count } = await query
      .order("resale_price", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      results: data,
      total,
      page: parseInt(page),
      pageSize: limit,
      totalPages
    });
  } catch (err) {
    console.error("Error searching properties:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};