import React, { useState } from 'react';

interface FileUploadProps {
    onFilesChange: (files: File[]) => void;
    files: File[];
    multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, files, multiple = false }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            if (multiple) {
                onFilesChange([...files, ...Array.from(selectedFiles)]);
            } else {
                onFilesChange([selectedFiles[0]]);
            }
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
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            if (multiple) {
                onFilesChange([...files, ...Array.from(droppedFiles)]);
            } else {
                onFilesChange([droppedFiles[0]]);
            }
        }
    };

    const handleRemove = (indexToRemove: number) => {
        onFilesChange(files.filter((_, index) => index !== indexToRemove));
    };

    if (files.length > 0) {
        return (
            <div className="w-full h-full bg-gray-900/50 p-2 rounded-xl border border-gray-700 animate-fade-in overflow-y-auto custom-scrollbar">
                <div className={`grid gap-2 ${multiple ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {files.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-black/30 p-1 rounded-lg flex flex-col items-center justify-center text-center">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-full max-w-full object-contain rounded-md"/>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-md">
                            <p className="truncate">{file.name}</p>
                        </div>
                        <button 
                            onClick={() => handleRemove(index)} 
                            className="absolute top-1 right-1 p-1 bg-gray-900/70 backdrop-blur-sm rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors transform hover:scale-110"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
                </div>
            </div>
        )
    }

    return (
        <label 
            htmlFor="file-upload" 
            className={`relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-sky-500 bg-sky-900/20 scale-105 shadow-lg shadow-sky-500/20' : 'border-gray-600 bg-gray-900/50 hover:border-sky-500/50'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-sky-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{filter: isDragging ? 'drop-shadow(0 0 5px var(--color-accent))' : 'none'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-300">
                Drop your creative(s) here, or <span className="text-sky-400 font-semibold">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports: JPG, PNG, WEBP</p>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple={multiple} />
        </label>
    );
};

export default FileUpload;