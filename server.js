import express from "express";
import dotenv from "dotenv";
import uploadRouter from "./routes/s3Upload.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// Apply CORS middleware before defining routes
app.use(cors({
  origin: 'https://botani-cart.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors());

app.use("/api", uploadRouter); // Route becomes /api/upload

// Basic health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});