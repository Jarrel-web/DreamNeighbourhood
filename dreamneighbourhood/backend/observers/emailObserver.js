export class EmailObserver {
  constructor(emailService) {
    this.emailService = emailService;
  }

  async update(event, data) {
    switch (event) {
      case 'USER_REGISTERED':
        await this.emailService.sendVerificationEmail(
          data.email, 
          data.username, 
          data.verificationToken
        );
        break;
      case 'PASSWORD_RESET_REQUESTED':
        await this.emailService.sendResetPasswordEmail(
          data.email,
          data.username,
          data.resetToken
        );
        break;
      default:
        break;
    }
  }
}