
import React, { useState } from 'react';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
    file: File | null;
    onRemove: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, file, onRemove }) => {
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
                <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-48 object-contain rounded-lg mb-4"/>
                <p className="text-sm font-medium text-slate-700 break-all">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                <button 
                    onClick={onRemove} 
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                    aria-label="Remove image"
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
            htmlFor="file-upload" 
            className={`relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all-fast ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">
                Drop your creative here, or <span className="text-blue-600 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports: JPG, PNG, WEBP</p>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
        </label>
    );
};

export default FileUpload;
