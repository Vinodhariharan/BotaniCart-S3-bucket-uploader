import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
app.use(express.json());

// Apply CORS middleware
app.use(cors({
  origin: 'https://botani-cart.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle OPTIONS preflight requests explicitly
app.options('*', cors());

// Health check endpoint
app.get('/api', (req, res) => {
  res.status(200).send('API is running');
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required" });
    }
    
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const timestamp = Date.now();
    const fileKey = `uploads/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    console.log("Processing upload request:", fileType, fileName);

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    res.status(500).json({ error: "Could not generate upload URL", message: err.message });
  }
});

// Create a serverless handler
const serverlessHandler = (req, res) => {
  // Express doesn't know about the path used by Vercel
  // so we need to modify the URL to match our routes
  const originalUrl = req.url;
  
  // If this isn't already an /api URL, prepend it
  if (!originalUrl.startsWith('/api')) {
    req.url = `/api${originalUrl}`;
  }
  
  // Forward the request to Express
  return app(req, res);
};

// Export the serverless handler function
export default serverlessHandler;