// models/Favourite.js
export class Favourite {
  constructor({ id, user_id, property_id, created_at, properties }) {
    this.id = id;
    this.user_id = user_id;
    this.property_id = property_id;
    this.created_at = created_at;
    this.properties = properties;
  }
}