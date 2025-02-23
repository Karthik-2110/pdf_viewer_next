"use client"

import Image from "next/image";
import { useState } from 'react';

export default function ExtractPdfText() {
    const [pdfUrl, setPdfUrl] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const extractText = async () => {
        if (!pdfUrl) return alert('Please enter a PDF URL');
        
        setLoading(true);
        try {
            const response = await fetch('/api/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfUrl }),
            });

            const data = await response.json();
            
            if (data.text) {
                setText(data.text);
            } else {
                alert('Failed to extract text');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter PDF URL"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                style={{ width: '300px', marginRight: '10px', color: 'black' }}
            />
            <button onClick={extractText} disabled={loading}>
                {loading ? 'Extracting...' : 'Extract Text'}
            </button>
            {text && (
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>{text}</pre>
            )}
        </div>
    );
}

