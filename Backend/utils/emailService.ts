import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  // host: process.env.SMTP_HOST || 'smtp.gmail.com',
  // port: parseInt(process.env.SMTP_PORT || '587'),
  // secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
};

// Create transporter
const transporter = nodemailer.createTransport({
  // host: emailConfig.host,
  // port: emailConfig.port,
  // secure: emailConfig.secure,
  service: "gmail",
  auth: emailConfig.auth,
});

/**
 * Send email verification link to user
 * @param email User's email address
 * @param token Verification token (plain text, will be included in URL)
 * @returns Promise that resolves when email is sent
 */
export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  const verificationLink = `${baseUrl}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || emailConfig.auth.user,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for signing up! Please click the link below to verify your email address:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, please ignore this email.
        </p>
      </div>
    `,
    text: `
      Thank you for signing up! Please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This link will expire in 24 hours. If you didn't create an account, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
