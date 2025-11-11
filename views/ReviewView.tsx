
import React from 'react';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import AdCopyEditor from '../components/AdCopyEditor';
import ApprovalTracker from '../components/ApprovalTracker';
import { AdCopy } from '../types';

interface ReviewViewProps {
    creativeFile: File | null;
    analysis: string;
    originalGoogleAds: AdCopy[];
    originalMetaAds: AdCopy[];
    updatedGoogleAds: AdCopy[];
    updatedMetaAds: AdCopy[];
    onApprove: () => void;
    onBack: () => void;
    isGenerated: boolean;
}

const ReviewView: React.FC<ReviewViewProps> = ({
    creativeFile,
    analysis,
    originalGoogleAds,
    originalMetaAds,
    updatedGoogleAds,
    updatedMetaAds,
    onApprove,
    onBack,
    isGenerated,
}) => {
    if (!creativeFile) return null;

    const imageUrl = URL.createObjectURL(creativeFile);

    return (
        <div className="w-full p-4 sm:p-8 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Review & Refine</h1>
                <p className="text-slate-500 mt-2">Review Gemini's analysis and suggestions. Approve to proceed to the verification step.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-1 space-y-6">
                    <ImagePreview imageUrl={imageUrl} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                    <ApprovalTracker />
                </div>

                {/* Right column */}
                <div className="lg:col-span-2">
                    <AdCopyEditor
                        originalGoogleCopy={originalGoogleAds}
                        originalMetaCopy={originalMetaAds}
                        updatedGoogleCopy={updatedGoogleAds}
                        updatedMetaCopy={updatedMetaAds}
                        isGenerated={isGenerated}
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="py-2 px-5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Back to Upload
                </button>
                <button
                    onClick={onApprove}
                    className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Approve & Continue
                </button>
            </div>
        </div>
    );
};

export default ReviewView;
