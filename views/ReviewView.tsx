import React from 'react';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import AdCopyEditor from '../components/AdCopyEditor';
import { AdCopy } from '../types';

interface ReviewViewProps {
    imageUrl: string;
    analysis: string;
    originalGoogleAds: AdCopy[];
    originalMetaAds: AdCopy[];
    updatedGoogleAds: AdCopy[];
    updatedMetaAds: AdCopy[];
    onSendForApproval: () => void;
    onDownloadExcel: () => void;
    isGenerated: boolean;
    isApproved: boolean;
}

const ReviewView: React.FC<ReviewViewProps> = ({
    imageUrl,
    analysis,
    originalGoogleAds,
    originalMetaAds,
    updatedGoogleAds,
    updatedMetaAds,
    onSendForApproval,
    onDownloadExcel,
    isGenerated,
    isApproved
}) => {
    const [isAnalysisPanelOpen, setAnalysisPanelOpen] = React.useState(true);

    return (
        <div className="w-full h-full p-8 flex flex-col bg-slate-50">
            <div className="flex-shrink-0 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Review & Update</h1>
                    <p className="text-slate-500 mt-2">
                        {isGenerated ? "Review the newly generated ad copy." : "Compare the original ad copy with Gemini's suggested updates."}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={onDownloadExcel}
                        className="px-6 py-3 bg-white text-slate-700 border border-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                        Download Excel
                    </button>
                    <button
                        onClick={onSendForApproval}
                        disabled={isApproved}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isApproved ? 'Sent for Approval' : 'Send for Approval'}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
                <div className="col-span-3 h-full overflow-y-auto custom-scrollbar">
                    <ImagePreview imageUrl={imageUrl} />
                </div>
                
                <div className={`${isAnalysisPanelOpen ? 'col-span-6' : 'col-span-9'} h-full transition-all duration-300`}>
                    <AdCopyEditor 
                        originalGoogleCopy={originalGoogleAds} 
                        originalMetaCopy={originalMetaAds}
                        updatedGoogleCopy={updatedGoogleAds}
                        updatedMetaCopy={updatedMetaAds}
                        isGenerated={isGenerated}
                    />
                </div>
                
                <div className={`${isAnalysisPanelOpen ? 'col-span-3' : 'hidden'} h-full`}>
                    <div className="relative h-full">
                        <button 
                            onClick={() => setAnalysisPanelOpen(!isAnalysisPanelOpen)}
                            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-6 h-10 bg-white border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="h-full overflow-y-auto custom-scrollbar">
                            <AnalysisResult analysis={analysis} />
                        </div>
                    </div>
                </div>

                 <div className={`${!isAnalysisPanelOpen ? 'col-span-0' : 'hidden'} h-full relative`}>
                     <button 
                        onClick={() => setAnalysisPanelOpen(true)}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-300 rounded-full flex items-center justify-center hover:bg-slate-100 shadow-lg"
                        title="Show Analysis"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                       </svg>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ReviewView;
