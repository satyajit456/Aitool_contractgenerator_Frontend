import React, { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Download, Edit3, Eye, Plus, Sparkles } from 'lucide-react';
import Header from '../../components/Header/Header';
import { BASE_URL } from '../../utils/Elements';
import axios from 'axios';

const Home = () => {
    const [mode, setMode] = useState('preview');
    const [prompt, setPrompt] = useState('');
    const [newPrompt, setNewPrompt] = useState('');
    const [documentText, setDocumentText] = useState('');
    const [isPromptSubmitted, setIsPromptSubmitted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const editableRef = useRef(null);

    const handleDownload = () => {
        const element = document.createElement('div');
        element.innerHTML = documentText;
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.padding = '20px';

        const opt = {
            margin: 0.5,
            filename: 'contract.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleGenerate = async (promptText) => {
        if (!promptText.trim()) return;

        setIsGenerating(true);
        try {
            const response = await axios.post(`${BASE_URL}/generate`, {
                prompt: promptText,
            });

            const data = response.data;
            setDocumentText(data.response);
            setIsPromptSubmitted(true);
            setPrompt(promptText);
            setNewPrompt('');
        } catch (error) {
            console.error('Error:', error);
            const errorMsg =
                error.response?.data?.error || 'Failed to generate contract';
            alert(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddPrompt = async () => {
        if (!newPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const response = await fetch(`${BASE_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: newPrompt,
                    existingText: documentText,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setDocumentText(data.response);
                setNewPrompt('');
            } else {
                alert(data.error || 'Something went wrong!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update contract');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleModeSwitch = () => {
        if (mode === 'preview') {
            setMode('edit');
            setIsEditing(true);
            // Small delay to ensure the ref is available and set initial content
            setTimeout(() => {
                if (editableRef.current) {
                    editableRef.current.innerHTML = documentText;
                    editableRef.current.focus();
                }
            }, 100);
        } else {
            // When switching from edit to preview, save the edited content
            if (editableRef.current) {
                setDocumentText(editableRef.current.innerHTML);
            }
            setMode('preview');
            setIsEditing(false);
        }
    };

    const handleSaveAndPreview = () => {
        // Save the edited content from the contentEditable div
        if (editableRef.current) {
            setDocumentText(editableRef.current.innerHTML);
        }
        setMode('preview');
    };

    const handleEditableChange = () => {
        // Update state in real-time as user types
        if (editableRef.current) {
            const currentContent = editableRef.current.innerHTML;
            setDocumentText(currentContent);
        }
    };

    // Function to handle when content is pasted
    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    const resetBuilder = () => {
        setIsPromptSubmitted(false);
        setPrompt('');
        setNewPrompt('');
        setDocumentText('');
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <Header resetBuilder={resetBuilder} isPromptSubmitted={isPromptSubmitted} />

            <main className="px-6 py-8">
                {!isPromptSubmitted ? (
                    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6">
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                Create Your Professional Contract
                            </h2>
                            <p className="text-sm text-gray-600 mb-6 text-center">
                                Describe your contract requirements and let AI generate a comprehensive legal document
                            </p>
                            <label className="block text-md font-semibold text-gray-900 mb-2">
                                Contract Requirements
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-grow bg-gray-50 text-gray-900 border border-gray-300 rounded-xl p-4 text-sm resize-none"
                                placeholder="Describe your contract in detail.... "
                            />
                            <button
                                onClick={() => handleGenerate(prompt)}
                                disabled={!prompt.trim() || isGenerating}
                                className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Generating Contract...</span>
                                    </div>
                                ) : (
                                    'Generate Professional Contract'
                                )}
                            </button>
                        </div>
                    </div>

                ) : (
                    <div className="flex gap-6  mx-auto px-6 py-8">
                        {/* Left: Contract Document */}
                        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Contract Document</h3>
                                    <p className="text-xs text-gray-600">Review and edit your generated contract</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleModeSwitch}
                                        className="flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs font-medium"
                                    >
                                        {mode === 'preview' ? <Edit3 className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                        {mode === 'preview' ? 'Edit' : 'Preview'}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 flex-grow overflow-auto">
                                {mode === 'preview' ? (
                                    <div
                                        className="bg-gray-50 rounded-lg border p-4 max-h-[450px] overflow-y-auto text-xs text-gray-800"
                                        style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.4' }}
                                        dangerouslySetInnerHTML={{ __html: documentText }}
                                    />
                                ) : (
                                    <>
                                        <div
                                            ref={editableRef}
                                            contentEditable={true}
                                            className="bg-gray-50 rounded-lg border p-4 max-h-[450px] overflow-y-auto text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-text"
                                            style={{ 
                                                fontFamily: 'Arial, sans-serif', 
                                                lineHeight: '1.4',
                                                minHeight: '450px'
                                            }}
                                            onInput={handleEditableChange}
                                            onBlur={() => {
                                                if (editableRef.current) {
                                                    setDocumentText(editableRef.current.innerHTML);
                                                }
                                            }}
                                            onPaste={handlePaste}
                                            onKeyDown={(e) => {
                                                // Allow all editing keys
                                                if (e.key === 'Tab') {
                                                    e.preventDefault();
                                                    document.execCommand('insertText', false, '    ');
                                                }
                                            }}
                                            suppressContentEditableWarning={true}
                                            spellCheck={true}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={handleSaveAndPreview}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-medium"
                                            >
                                                Save & Preview
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: Modify Contract Requirements */}
                        <div className="w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                <Plus className="h-4 w-4 mr-2 text-indigo-600" />
                                Modify Contract Requirements
                            </h3>
                            <p className="text-xs text-gray-600 mb-4">
                                Add additional requirements, modifications, or specific clauses to enhance your contract
                            </p>
                            <textarea
                                rows={3}
                                value={newPrompt}
                                onChange={(e) => setNewPrompt(e.target.value)}
                                className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg p-3 text-xs placeholder-gray-500 resize-none"
                                placeholder="Example: Add a confidentiality clause, modify payment terms..."
                            />
                            <div className="flex justify-end mt-auto pt-4">
                                <button
                                    onClick={handleAddPrompt}
                                    disabled={!newPrompt.trim() || isGenerating}
                                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    <span>{isGenerating ? 'Updating...' : 'Update Contract'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;