import * as xlsx from "xlsx";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Configure S3 Client
const s3Client = new S3Client({
  region: "us-east-1", // Update with your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to upload to S3
async function uploadToS3(buffer, fileName, bucketName, folder) {
  const key = `${folder}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ACL: "private",
  });
  await s3Client.send(command);
  return key;
}

// Helper function to download from S3
async function downloadFromS3(bucketName, key) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  const { Body } = await s3Client.send(command);

  // Convert stream to buffer
  const chunks = [];
  for await (const chunk of Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Helper function to delete from S3
async function deleteFromS3(bucketName, key) {
  const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
  await s3Client.send(command);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = [];

    // Extract all files from the request
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];
    const bucketName = "uchith"; 
    for (const file of files) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        try {
          const buffer = await file.arrayBuffer();
          const fileName = file.name;
          const folder = "uploaded-files";

          // Upload file to S3
          const key = await uploadToS3(Buffer.from(buffer), fileName, bucketName, folder);

          // Download file from S3 for processing
          const downloadedBuffer = await downloadFromS3(bucketName, key);

          // Process Excel file
          const workbook = xlsx.read(downloadedBuffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = xlsx.utils.sheet_to_json(sheet);

          results.push({ fileName, data: jsonData });

          // Clean up: Delete file from S3
          await deleteFromS3(bucketName, key);
        } catch (error) {
          console.log(`Error processing file ${file.name}:`, error);
          results.push({
            fileName: file.name,
            error: `Failed to process file: ${error.message}`,
          });
        }
      } else {
        results.push({
          fileName: file.name,
          error: "Invalid file type. Only Excel files are supported.",
        });
      }
    }

    console.log(results);

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Error processing Excel files:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process files.", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
