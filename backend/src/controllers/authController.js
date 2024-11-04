import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import '../config/passport.js'; // import passport strategy configs

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

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
    text: ` Welcome to my project!, Your OTP is ${otp}`,
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




