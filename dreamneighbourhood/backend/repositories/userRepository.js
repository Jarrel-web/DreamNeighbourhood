import { pool } from "../config/db.js";

export class UserRepository {
  async findByEmail(email) {
    const { data, error } = await pool
      .from("users")
      .select("*")
      .eq("email", email);
    
    if (error) throw error;
    return data?.[0] || null;
  }

  async findById(id) {
    const { data, error } = await pool
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findByVerificationToken(token) {
    const { data, error } = await pool
      .from("users")
      .select("*")
      .eq("verification_token", token)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findByResetToken(token) {
    const { data, error } = await pool
      .from("users")
      .select("*")
      .eq("reset_token", token)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(userData) {
    const { data, error } = await pool
      .from("users")
      .insert([userData])
      .select("id, username, email, is_verified")
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await pool
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await pool
      .from("users")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return true;
  }
}