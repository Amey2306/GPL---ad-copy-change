
import React from 'react';

interface ImagePreviewProps {
    imageUrl: string;
    isCompact?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, isCompact = false }) => {
    if (isCompact) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-3">Creative Preview</h3>
                <div className="rounded-lg overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="Creative preview" className="object-contain w-full h-auto bg-slate-100" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="sticky top-0 bg-white py-2">
                <h3 className="text-lg font-semibold text-slate-800">Uploaded Creative</h3>
            </div>
            <div className="mt-4 rounded-lg overflow-hidden">
                <img src={imageUrl} alt="Creative preview" className="object-contain w-full h-full" />
            </div>
        </div>
    );
};

export default ImagePreview;
