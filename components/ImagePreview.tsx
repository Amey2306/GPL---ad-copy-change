import React from 'react';

interface ImagePreviewProps {
    imageUrls: string[];
    isCompact?: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrls, isCompact = false }) => {
    const title = imageUrls.length > 1 ? 'Uploaded Creatives' : 'Uploaded Creative';
    const gridCols = imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1';

    const cardClasses = "bg-gray-800 p-4 rounded-xl border border-gray-700";

    if (isCompact) {
        return (
            <div className={cardClasses}>
                <h3 className="text-base font-semibold text-gray-100 mb-3">{title}</h3>
                <div className="rounded-lg overflow-hidden border border-gray-700 max-h-96 overflow-y-auto custom-scrollbar">
                    <div className={`grid ${gridCols} gap-2 p-2 bg-gray-900/50`}>
                        {imageUrls.map((url, index) => (
                            <img key={index} src={url} alt={`Creative preview ${index + 1}`} className="object-contain w-full h-auto bg-black/30 rounded-md" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={cardClasses}>
             <div className="sticky top-0 bg-gray-800 py-2">
                <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
            </div>
            <div className="mt-4 rounded-lg overflow-hidden space-y-4">
                 {imageUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Creative preview ${index + 1}`} className="object-contain w-full h-full" />
                ))}
            </div>
        </div>
    );
};

export default ImagePreview;