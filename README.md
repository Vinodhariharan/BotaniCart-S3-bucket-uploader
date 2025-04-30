# BotaniCart S3 Upload Server

A minimal Express.js backend that returns presigned AWS S3 `PUT` URLs for secure, direct-to-S3 uploads.

## Features
- Secure presigned URL generation
- Timestamped file naming
- Hides AWS credentials from frontend

## Setup
1. Install dependencies:
```bash
npm install
```

2. Add a `.env` file:
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
```

3. Start the server:
```bash
npm run dev
```

## API
### `POST /api/upload`
**Request:**
```json
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg"
}
```
**Response:**
```json
{
  "uploadUrl": "https://...signed-url...",
  "fileUrl": "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/<timestamp>-image.jpg"
}
```

## Example Frontend Upload (React)
```js
const handleUpload = async (file) => {
  const res = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
  });

  const { uploadUrl, fileUrl } = await res.json();

  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  console.log("File uploaded to:", fileUrl);
};
```
