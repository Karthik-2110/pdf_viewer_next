"use client"

import { useState } from 'react';

export default function ExtractPdfText() {
    const [pdfUrl, setPdfUrl] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const extractText = async () => {
        if (!pdfUrl) return alert('Please enter a PDF URL');
        
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch('/api/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfUrl }),
            });

            const data = await response.json();
            
            if (data.text) {
                setText(data.text);
                await analyzeResume(data.text);
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

    const analyzeResume = async (resumeText: string) => {
        setAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: resumeText }),
            });

            const data = await response.json();
            if (data.result) {
                setResult(data.result);
            }
        } catch (error) {
            console.error('Error analyzing resume:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Enter PDF URL"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-2 text-black"
                />
                <button 
                    onClick={extractText} 
                    disabled={loading || analyzing}
                    className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Extracting...' : 'Extract and Analyze Resume'}
                </button>
            </div>

            {analyzing && (
                <div className="text-center my-4 text-blue-500">
                    Analyzing resume...
                </div>
            )}

            {result && (
                <div className={`p-4 rounded-lg mb-4 text-center text-2xl font-bold ${result === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result}
                </div>
            )}

            {text && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
                    <pre className="whitespace-pre-wrap p-4 bg-gray-100 rounded-lg text-black">{text}</pre>
                </div>
            )}
        </div>
    );
}

