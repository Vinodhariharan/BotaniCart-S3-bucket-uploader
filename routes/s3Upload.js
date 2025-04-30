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

    console.log(fileType,fileName);

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ uploadUrl, fileUrl });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    res.status(500).json({ error: "Could not generate upload URL" });
  }
});

export default router;
