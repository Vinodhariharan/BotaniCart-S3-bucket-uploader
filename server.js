import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRouter from "./routes/s3Upload.js";

dotenv.config();

const app = express();

// Configure CORS - this is crucial
app.use(cors({
  origin: ["https://botani-cart.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors()); 

app.use(express.json());

app.use("/api", uploadRouter); // Route becomes /api/upload

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});