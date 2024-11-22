
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs"; // to write a temporary file
import path from "path"; // to handle file paths

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the incoming FormData
    const formData = await request.formData();
    const prompt = formData.get("prompt");
    const files = [];
    const model = genAI.getGenerativeModel({
        // Choose a Gemini model.
        model: "gemini-1.5-flash",
      });

    // Extract the files from FormData
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value); // Only handle files
      }
    }

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.all(
      files.map(async (file, index) => {
        try {
          // Convert file to Buffer using FileReader
          const buffer = await file.arrayBuffer();

          // Use /tmp directory on Vercel for file storage
          const tempDir = "/tmp";
          const tempFilePath = path.join(tempDir, file.name);

          // Ensure the directory exists before writing the file
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          // Write the file to the temporary directory
          fs.writeFileSync(tempFilePath, Buffer.from(buffer)); // Write to temporary file

          // Upload the file using the file path (you can use the Buffer directly if needed)
          const uploadResponse = await fileManager.uploadFile(tempFilePath, {
            mimeType: file.type,
            displayName: `Uploaded Document ${index + 1}`,
          });

          console.log("Upload Response:", uploadResponse);

          // Generate content using the model and the uploaded file's URI
          const result = await model.generateContent([
            {
              fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
              },
            },
            { text: prompt || "Can you summarize this document as a bulleted list?" },
          ]);

          return result.response.text();
        } catch (error) {
          console.error(`Error processing file ${index + 1}:`, error);
          throw new Error(`Failed to process file ${index + 1}: ${error.message}`);
        }
      })
    );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing files with Gemini API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process files.", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
