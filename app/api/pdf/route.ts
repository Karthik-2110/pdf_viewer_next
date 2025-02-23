
import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request: Request) {
  try {
    const { pdfUrl } = await request.json();

    const response = await fetch(pdfUrl);

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer)

    const pdfParser = new (PDFParser as any)(null, 1);

    const parsedText = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error) => {
        reject(errData.message);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent();
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
