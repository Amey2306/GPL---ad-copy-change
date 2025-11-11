import React from 'react';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import VerificationResultDisplay from '../components/VerificationResult';
import { VerificationResult, Project } from '../types';

interface VerifyViewProps {
    imageUrl: string;
    analysis: string;
    results: VerificationResult[];
    isLoading: boolean;
    onVerify: () => void;
    project: Project;
}

const VerifyView: React.FC<VerifyViewProps> = ({
    imageUrl,
    analysis,
    results,
    isLoading,
    onVerify,
    project
}) => {
    return (
        <div className="w-full h-full p-8 flex flex-col bg-slate-50">
             <div className="flex-shrink-0 mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Verify Live Changes</h1>
                    <p className="text-slate-500 mt-2">
                        Check if the approved changes for <span className="font-semibold text-slate-600">{project.name}</span> have been updated on the live websites.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onVerify}
                        disabled={isLoading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying...
                            </div>
                        ) : results.length > 0 ? 'Re-verify Live Changes' : 'Verify Live Changes'}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
                <div className="col-span-3 h-full overflow-y-auto custom-scrollbar space-y-6">
                    <ImagePreview imageUrl={imageUrl} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                </div>
                
                <div className="col-span-9 h-full overflow-y-auto custom-scrollbar pr-2">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Verification Status for {project.name}</h3>
                    <VerificationResultDisplay results={results} />
                </div>
            </div>
        </div>
    );
};

export default VerifyView;