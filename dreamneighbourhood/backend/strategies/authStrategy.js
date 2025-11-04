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
      
      
      if (!user) {
       
        return null;
      }

      // Check if user has password (in case of social logins etc.)
      if (!user.password) {
        
        return null;
      }

      
      const isMatch = await this.bcrypt.compare(password, user.password);
    
      
      if (!isMatch) {
        
        return null;
      }

     

    return user;
  }
}