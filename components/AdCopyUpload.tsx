
import React, { useState } from 'react';

interface AdCopyUploadProps {
    onFileUpload: (file: File) => void;
    file: File | null;
    onRemove: () => void;
}

const AdCopyUpload: React.FC<AdCopyUploadProps> = ({ onFileUpload, file, onRemove }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
            onFileUpload(droppedFile);
        }
    };

    if (file) {
        return (
             <div className="relative w-full h-full bg-slate-100 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-emerald-500 mb-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-slate-700 break-all">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                    onClick={onRemove} 
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label="Remove Excel file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <label 
            htmlFor="ad-copy-upload" 
            className={`relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all-fast ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">
                Drop your ad copy Excel here, or <span className="text-blue-600 font-semibold">browse</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">'Google' &amp; 'Meta' sheets required</p>
            <input id="ad-copy-upload" name="ad-copy-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
        </label>
    );
};

export default AdCopyUpload;
