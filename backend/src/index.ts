import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: "*", // Allows any website to talk to this API
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check 
app.get("/health", (_req, res) => {
  res.status(200).send("Server is healthy");
});

app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});