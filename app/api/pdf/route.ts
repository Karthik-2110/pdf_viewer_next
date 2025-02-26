
import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();

    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Empty PDF content');
    }

    const buffer = Buffer.from(arrayBuffer)

    const pdfParser = new (PDFParser as any)(null, 1);

    interface PDFParserResult {
      text: string;
    }

    let parsedText = await new Promise<PDFParserResult>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error) => {
        reject(errData.message);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    // Clean up the parsed text
    const textContent = (parsedText as PDFParserResult).text || '';
    const cleanedText = textContent.toString()
      .replace(/\\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) {
      throw new Error('No text content extracted from PDF');
    }

    return NextResponse.json({ text: cleanedText });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
