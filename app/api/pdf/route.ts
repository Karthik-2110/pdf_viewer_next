import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

// Define proper type for PDFParser constructor
interface PDFParserConstructor {
  new (pdfFilePath: string | null, pdfPassword?: number): PDFParser;
}

// Define error type based on library documentation
interface PDFParserError {
  parserError: Error;
}

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();
    
    // console.log('Processing PDF from URL:', pdfUrl);

    // Fetch the PDF file
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      console.error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer)

    // console.log(`PDF fetched successfully, size: ${buffer.length} bytes`);

    // Cast PDFParser to the correct constructor type
    /* eslint-disable @typescript-eslint/no-explicit-any */
    // If the fix above doesn't work, fallback to this:
    const pdfParser = new (PDFParser as any)(null, 1);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const parsedText = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: PDFParserError) => {
        console.error('PDF parsing error:', errData.parserError.message);
        reject(errData.parserError.message);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent();
        // console.log(`PDF parsed successfully, extracted text length: ${text.length} characters`);
        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({ text: parsedText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
