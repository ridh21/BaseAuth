import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import passport from "passport";
import cookieParser from "cookie-parser";
// import session from 'express-session';

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//     },
//   })
// );

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
