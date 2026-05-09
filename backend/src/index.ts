import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});