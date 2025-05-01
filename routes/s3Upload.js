import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Add CORS headers middleware specifically for this router
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://botani-cart.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// OPTIONS handler specifically for the upload endpoint
router.options("/upload", (req, res) => {
  res.status(200).end();
});

router.post("/upload", async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    console.log(fileType, fileName);

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Set CORS headers again just to be sure
    res.header('Access-Control-Allow-Origin', 'https://botani-cart.vercel.app');
    res.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    res.status(500).json({ error: "Could not generate upload URL" });
  }
});

// Add a simple test endpoint
router.get("/test", (req, res) => {
  res.json({ status: "API is working!" });
});

export default router;