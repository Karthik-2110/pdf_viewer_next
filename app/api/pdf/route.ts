import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();
    
    console.log('Processing PDF from URL:', pdfUrl);

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

    console.log(`PDF fetched successfully, size: ${buffer.length} bytes`);

    const pdfParser = new (PDFParser as any)(null, 1);

    const parsedText = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error) => {
        console.error('PDF parsing error:', errData.message);
        reject(errData.message);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent();
        console.log(`PDF parsed successfully, extracted text length: ${text.length} characters`);
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
