import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Parse the incoming JSON body containing base64-encoded files
    const { files } = await request.json();

    // Ensure that files are provided
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    // Process each file and send it to OpenAI
    const responses = await Promise.all(
      files.map(async (base64File) => {
        const base64Image = base64File; // Assuming the files are already base64 encoded

        // Send the base64 image and prompt to OpenAI for processing
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',  // Use the appropriate model version
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `I want data in image in this json format. give only json donot give nay text
                  {
                    bill_no: '',
                    date: '',
                    customer_name: '',
                    phone_number: '',
                    gstin: '',
                    total_items: 0,
                    igst: '',
                    CGST:'',
                    igst_amount: 0,
                    total_amount: 0,
                    products: [
                      {
                        name: '',
                        quantity: 0,
                        unit_price: 0,
                        discount: 0,
                        price_with_tax: 0,
                      },
                    ],
                }
                `,  // Adjust prompt as needed
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,  // Base64 image string
                  },
                },
              ],
            },
          ],
        });

        return response.choices[0].message.content;
      })
    );


    return NextResponse.json({ results: responses });

  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json({ error: 'Failed to process files' }, { status: 500 });
  }
}
