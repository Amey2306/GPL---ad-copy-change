import React from 'react';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import AdCopyEditor from '../components/AdCopyEditor';
import ApprovalTracker from '../components/ApprovalTracker';
import { AdCopy, AppState, ApprovalEvent } from '../types';

interface ReviewViewProps {
    appState: AppState;
    creativeFile: File | null;
    analysis: string;
    originalGoogleAds: AdCopy[];
    originalMetaAds: AdCopy[];
    updatedGoogleAds: AdCopy[];
    updatedMetaAds: AdCopy[];
    onSendForApproval: () => void;
    onMarkAsApproved: () => void;
    onProceedToVerify: () => void;
    onBack: () => void;
    isGenerated: boolean;
    approvalHistory: ApprovalEvent[];
}

const ReviewView: React.FC<ReviewViewProps> = ({
    appState,
    creativeFile,
    analysis,
    originalGoogleAds,
    originalMetaAds,
    updatedGoogleAds,
    updatedMetaAds,
    onSendForApproval,
    onMarkAsApproved,
    onProceedToVerify,
    onBack,
    isGenerated,
    approvalHistory
}) => {
    if (!creativeFile) return null;

    const imageUrl = URL.createObjectURL(creativeFile);

    const renderActionButtons = () => {
        switch (appState) {
            case AppState.REVIEW:
                return (
                    <button
                        onClick={onSendForApproval}
                        className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Send for Approval
                    </button>
                );
            case AppState.APPROVAL_PENDING:
                 return (
                    <button
                        onClick={onMarkAsApproved}
                        className="py-3 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Mark as Approved
                    </button>
                );
            case AppState.APPROVED:
                 return (
                    <button
                        onClick={onProceedToVerify}
                        className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Proceed to Verification
                    </button>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full p-4 sm:p-8 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Review & Refine</h1>
                <p className="text-slate-500 mt-2">Review Gemini's analysis and updated copy. Manage the approval process to proceed.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-1 space-y-6">
                    <ImagePreview imageUrl={imageUrl} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                    <ApprovalTracker history={approvalHistory} status={appState} />
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
                    disabled={appState !== AppState.REVIEW}
                    className="py-2 px-5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back to Upload
                </button>
                {renderActionButtons()}
            </div>
        </div>
    );
};

export default ReviewView;
