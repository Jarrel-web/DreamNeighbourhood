export class AuthStrategy {
  async authenticate(credentials) {
    throw new Error("Method not implemented");
  }
}

export class EmailPasswordStrategy extends AuthStrategy {
  constructor(userRepository, bcrypt) {
    super();
    this.userRepository = userRepository;
    this.bcrypt = bcrypt;
  }

  async authenticate({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isMatch = await this.bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }
}