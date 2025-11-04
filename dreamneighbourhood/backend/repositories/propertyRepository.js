// repositories/PropertyRepository.js
import { pool } from "../config/db.js";

export class PropertyRepository {
  // GET default properties (NO PAGINATION - return all) - EXACT SAME
  async findAll() {
    const { data, error } = await pool
      .from("properties")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // GET property by ID - EXACT SAME
  async findById(id) {
    const { data, error } = await pool
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }
   async exists(propertyId) {
    const { data, error } = await pool
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (error) {
  
      if (error.code === 'PGRST116') { // No rows returned
        return false;
      }
      throw error;
    }
    return !!data;
  }
  async findByTown(town) {
    const { data, error } = await pool
      .from("properties")
      .select("*")
      .eq("town", town);

    if (error) throw error;
    return data || [];
  }
}