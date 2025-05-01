import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure API behavior
export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://botani-cart.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS (preflight) requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { fileName, fileType } = req.body;
      
      if (!fileName || !fileType) {
        return res.status(400).json({ error: "fileName and fileType are required" });
      }
      
      // Initialize S3 client
      const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const timestamp = Date.now();
      const fileKey = `uploads/${timestamp}-${fileName}`;

      // Create command to get presigned URL
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
      });

      console.log("Processing upload request:", { fileType, fileName });

      // Generate the presigned URL
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

      // Generate the final URL where the file will be accessible
      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // Return the URLs to the client
      return res.status(200).json({ uploadUrl, fileUrl });
    } catch (err) {
      console.error("Failed to generate presigned URL:", err);
      return res.status(500).json({ error: "Could not generate upload URL", message: err.message });
    }
  }

  // Handle any other HTTP methods
  return res.status(405).json({ error: "Method not allowed" });
}