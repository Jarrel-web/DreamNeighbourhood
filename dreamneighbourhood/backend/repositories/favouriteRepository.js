// repositories/FavouriteRepository.js
import { pool } from "../config/db.js";

export class FavouriteRepository {

  async findByUserAndProperty(userId, propertyId) {
    const { data, error } = await pool
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (error) throw error;
    return data;
  }

  async findAllByUser(userId) {
    const { data, error } = await pool
      .from("user_favorites")
      .select("*, properties(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  
  async create(userId, propertyId) {
    const { error } = await pool
      .from("user_favorites")
      .insert([{ user_id: userId, property_id: propertyId }]);

    if (error) throw error;
    return true;
  }

  
  async delete(userId, propertyId) {
    const { error } = await pool
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (error) throw error;
    return true;
  }

  async exists(propertyId) {
    const { data, error } = await pool
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (error) throw error;
    return !!data;
  }
}