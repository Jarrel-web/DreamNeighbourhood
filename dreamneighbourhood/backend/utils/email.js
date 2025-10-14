import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465,              
  secure: true,          
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});


export const sendVerificationEmail = async (toEmail,username, verificationToken) => {
  try {
    const url = `${process.env.BASE_URL}/api/v1/users/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"DreamNeighbourhood" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Verify Your Email',
      html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Verify your email address</h2>
        <p>Hey ${username},</p>
        <p>Thanks for signing up for <b>Dreamneighbourhood</b>! Please verify your email below:</p>
        <p><a href="${url}" style="
            background-color:#2563eb;
            color:#fff;
            padding:10px 18px;
            text-decoration:none;
            border-radius:6px;
          ">Verify Email</a></p>
        <p>If you didn’t create an account, you can ignore this email.</p>
      </body>
    </html>
  `,
    });
    console.log('Verification email sent to', toEmail);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};
