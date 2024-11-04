import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import '../config/passport.js'; // import passport strategy configs

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

const generateOTPEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 3px 6px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 40px 30px; text-align: center; background-color: #4F46E5; border-radius: 10px 10px 0 0;">
            <img src="https://your-logo-url.com" alt="Logo" width="150" style="margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Verify Your Email Address</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <p style="color: #333333; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
              Thanks for signing up! Please use the verification code below to complete your registration:
            </p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">${otp}</span>
            </div>
            <p style="color: #666666; font-size: 14px; line-height: 21px; margin-bottom: 0;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px; background-color: #f8fafc; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: #666666; font-size: 12px; margin: 0;">
              © 2024 Your Company Name. All rights reserved.<br>
              123 Street Name, City, Country
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};



export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, otp },
    });
    await sendOtpEmail(email, otp); // send OTP via email
    res.json({ message: 'Signup successful, verify your email' });
  } catch (error) {
    res.status(400).json({ error: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  if (!user.emailVerified) {
    return res.status(400).json({ error: 'Please verify your email' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && user.otp === otp) {
    await prisma.user.update({ 
      where: { email }, 
      data: { emailVerified: true } 
    });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ verified: true, token });
  } else {
    res.status(400).json({ verified: false, message: 'Invalid OTP' });
  }
};

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification',
    html: generateOTPEmailTemplate(otp)
  });
};

// Google OAuth
// export const googleCallback = (req, res, next) => {
//   passport.authenticate('google', { session: false }, (err, data) => {
//     const token = data?.token;
//     const redirectUrl = token 
//       ? `http://localhost:5173/welcome?token=${token}`
//       : 'http://localhost:5173/login';
//     res.redirect(redirectUrl);
//   })(req, res, next);
// };

export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const githubAuth = (req, res, next) => {
  passport.authenticate('github', { 
    scope: ['user:email'],
    failureRedirect: 'http://localhost:5173/login',
    // Add session handling
    session: true
  })(req, res, next);
};


export const googleCallback = (req, res, next) => {
  passport.authenticate('google', {
    session: false,
    successRedirect: 'http://localhost:5173/welcome',
    failureRedirect: 'http://localhost:5173/login',
    failureMessage: true
  })(req, res, next);
};


export const githubCallback = (req, res) => {
  passport.authenticate('github', { session: false }, async (err, userData) => {
    if (err || !userData) {
      return res.redirect('http://localhost:5173/login');
    }

    const token = jwt.sign(
      { userId: userData.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie or header
    res.cookie('token', token, { httpOnly: true });
    
    // Redirect with token in URL
    return res.redirect(`http://localhost:5173/welcome?token=${token}`);
  })(req, res);
};




