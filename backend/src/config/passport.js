import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ 
          where: { googleId: profile.id } 
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value,
              username: profile.displayName,
              emailVerified: true
            },
          });
        }

        console.log('JWT_SECRET:', JWT_SECRET); // Verify secret is available
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        console.log('Generated Token:', token); // Verify token generation

        return done(null, { user, token });
      } catch (error) {
        console.error('Token Generation Error:', error);
        return done(error);
      }
    }
  )
);
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // First try to find user by githubId
        let user = await prisma.user.findUnique({
          where: { githubId: profile.id.toString() },
        });

        if (!user) {
          // Get email safely
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : `${profile.username}@github.com`;

          // Check if user exists with this email
          user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Update existing user with githubId
            user = await prisma.user.update({
              where: { id: user.id },
              data: { githubId: profile.id.toString() },
            });
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                githubId: profile.id.toString(),
                username: profile.username,
                email: email,
                emailVerified: true,
              },
            });
          }
        }

        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            username: user.username,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
