import React from 'react';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import AdCopyEditor from '../components/AdCopyEditor';
import ApprovalTracker from '../components/ApprovalTracker';
import { AdCopy, AppState, ApprovalEvent, BrandManager } from '../types';

interface ReviewViewProps {
    appState: AppState;
    creativeFiles: File[];
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
    brandManager: BrandManager | null;
}

const ReviewView: React.FC<ReviewViewProps> = ({
    appState,
    creativeFiles,
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
    approvalHistory,
    brandManager
}) => {
    if (creativeFiles.length === 0) return null;

    const imageUrls = creativeFiles.map(file => URL.createObjectURL(file));

    const renderActionButtons = () => {
        switch (appState) {
            case AppState.REVIEW:
                return (
                    <div className="text-right">
                        <button
                            onClick={onSendForApproval}
                            className="py-3 px-8 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-400 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Send for Approval
                        </button>
                         {brandManager && <p className="text-xs text-gray-500 mt-2">Will be sent to: <span className="font-medium text-gray-400">{brandManager.name}</span></p>}
                    </div>
                );
            case AppState.APPROVAL_PENDING:
                 return (
                    <button
                        onClick={onMarkAsApproved}
                        className="py-3 px-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Mark as Approved
                    </button>
                );
            case AppState.APPROVED:
                 return (
                    <button
                        onClick={onProceedToVerify}
                        className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-400 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Proceed to Verification
                    </button>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full h-full p-4 sm:p-8 bg-gray-900 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Review & Refine</h1>
                <p className="text-gray-400 mt-2">Review Gemini's analysis and updated copy. Manage the approval process to proceed.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ImagePreview imageUrls={imageUrls} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                    <ApprovalTracker history={approvalHistory} status={appState} />
                </div>

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
                    className="py-2 px-5 bg-gray-700 text-gray-200 font-semibold rounded-lg shadow-sm border border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back to Upload
                </button>
                {renderActionButtons()}
            </div>
        </div>
    );
};

export default ReviewView;