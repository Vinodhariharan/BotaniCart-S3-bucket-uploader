import express from "express";
import dotenv from "dotenv";
import uploadRouter from "./routes/s3Upload.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',  // Allow requests only from your frontend's URL
  }));

app.use("/api", uploadRouter); // Route becomes /api/upload

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
