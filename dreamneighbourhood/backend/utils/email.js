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


export const sendVerificationEmail = async (toEmail, verificationToken) => {
  try {
    const url = `${process.env.BASE_URL}/api/v1/users/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"DreamNeighbourhood" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
    console.log('Verification email sent to', toEmail);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};
