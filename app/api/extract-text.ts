import fetch from 'node-fetch';
import pdf from 'pdf-parse';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { pdfUrl } = req.body;

    if (!pdfUrl) {
        return res.status(400).json({ error: 'PDF URL is required' });
    }

    try {
        // Fetch PDF from URL
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch PDF');
        }

        const buffer = await response.arrayBuffer();
        const data = await pdf(Buffer.from(buffer));

        res.status(200).json({ text: data.text });
    } catch (err) {
        console.log(err)
    }
}
