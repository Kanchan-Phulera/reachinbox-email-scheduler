import express from "express";
import cors from "cors";
import emailRoutes from "./routes/email.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ReachInbox Email Scheduler API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Email routes
app.use("/api/emails", emailRoutes);

export default app;