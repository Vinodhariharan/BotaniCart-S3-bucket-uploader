// api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// This configuration tells Vercel to handle this function differently
export const config = {
  runtime: 'edge', // Use Edge runtime for better CORS handling
};

export default async function handler(req) {
  // Early return for OPTIONS requests with proper CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No Content for OPTIONS
      headers: {
        'Access-Control-Allow-Origin': 'https://botani-cart.vercel.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours cache for preflight
      },
    });
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://botani-cart.vercel.app',
      },
    });
  }

  try {
    // Parse the request body
    const body = await req.json();
    const { fileName, fileType } = body;
    
    if (!fileName || !fileType) {
      return new Response(JSON.stringify({ error: 'fileName and fileType are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://botani-cart.vercel.app',
        },
      });
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

    // Create command for presigned URL
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    // Generate presigned URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    // Generate the final file URL
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Return successful response with CORS headers
    return new Response(JSON.stringify({ uploadUrl, fileUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://botani-cart.vercel.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    // Return error response with CORS headers
    return new Response(JSON.stringify({ error: 'Server error', message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://botani-cart.vercel.app',
      },
    });
  }
}