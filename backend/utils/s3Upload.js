const fs = require('fs');
const path = require('path');

/**
 * Uploads a file (base64 string or buffer) to S3, falling back to local file storage.
 * @param {string|Buffer} fileData - The base64 file data or file Buffer.
 * @param {string} fileName - The desired name of the file.
 * @param {string} folder - Subfolder in S3 (e.g. 'resumes', 'certificates').
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
const uploadToS3 = async (fileData, fileName, folder = 'uploads') => {
  // Clean filename to prevent spaces or path injection issues
  const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  
  // Extract buffer from base64 if needed
  let buffer;
  if (Buffer.isBuffer(fileData)) {
    buffer = fileData;
  } else if (typeof fileData === 'string') {
    if (fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }
  } else {
    throw new Error('Invalid file data format. Expected base64 string or Buffer.');
  }

  // 1. Attempt AWS S3 Upload
  try {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_BUCKET_NAME) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });

      const key = `${folder}/${cleanFileName}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png'
      }));

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
      console.log(`[AWS S3] Uploaded successfully: ${url}`);
      return url;
    }
  } catch (error) {
    console.log('[AWS S3] Client load or upload failed, falling back to local storage:', error.message);
  }

  // 2. Fallback: Save Locally to the backend public folder
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const uploadDir = path.join(publicDir, folder);
    
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, cleanFileName);
    fs.writeFileSync(filePath, buffer);
    
    const localUrl = `/public/${folder}/${cleanFileName}`;
    console.log(`[Local Upload] Saved file to local public path: ${localUrl}`);
    return localUrl;
  } catch (error) {
    console.error('[Upload Service] Local write error:', error);
    return `/public/${folder}/${cleanFileName}`;
  }
};

module.exports = { uploadToS3 };
