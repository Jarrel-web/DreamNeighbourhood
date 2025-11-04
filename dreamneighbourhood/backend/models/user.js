export class User {
  constructor({ id, username, email, password, is_verified, verification_token, reset_token, reset_token_expiry }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.is_verified = is_verified;
    this.verification_token = verification_token;
    this.reset_token = reset_token;
    this.reset_token_expiry = reset_token_expiry;
  }
}