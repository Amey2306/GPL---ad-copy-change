import React, { useState } from 'react';
import { AdCopy } from '../types';

interface AdCopyEditorProps {
    originalGoogleCopy: AdCopy[];
    originalMetaCopy: AdCopy[];
    updatedGoogleCopy: AdCopy[];
    updatedMetaCopy: AdCopy[];
    isGenerated: boolean;
}

const AdCopyCard: React.FC<{ title: string, copy: AdCopy[], isUpdated?: boolean }> = ({ title, copy, isUpdated = false }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
        <h4 className="text-md font-semibold text-slate-700 mb-3">{title}</h4>
        <div className="space-y-3">
            {copy.map((ad, index) => (
                <div key={index} className="text-sm p-3 rounded-md bg-slate-50 border border-slate-200">
                    <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">{ad.field}</p>
                    <p className={`mt-1 ${isUpdated ? 'text-blue-700' : 'text-slate-800'}`}>{ad.text}</p>
                </div>
            ))}
        </div>
    </div>
);

const AdCopyEditor: React.FC<AdCopyEditorProps> = ({ 
    originalGoogleCopy, 
    originalMetaCopy, 
    updatedGoogleCopy, 
    updatedMetaCopy,
    isGenerated
}) => {
    const [activeTab, setActiveTab] = useState<'google' | 'meta'>('google');

    const renderComparison = (original: AdCopy[], updated: AdCopy[], platform: string) => (
        <div className="grid grid-cols-2 gap-6">
            <AdCopyCard title={`Original ${platform} Copy`} copy={original} />
            <AdCopyCard title={`Gemini's Suggestions`} copy={updated} isUpdated />
        </div>
    );
    
    const renderGenerated = (copy: AdCopy[], platform: string) => (
         <AdCopyCard title={`Generated ${platform} Copy`} copy={copy} isUpdated />
    );

    const googleContent = isGenerated
        ? renderGenerated(updatedGoogleCopy, 'Google')
        : renderComparison(originalGoogleCopy, updatedGoogleCopy, 'Google');
        
    const metaContent = isGenerated
        ? renderGenerated(updatedMetaCopy, 'Meta')
        : renderComparison(originalMetaCopy, updatedMetaCopy, 'Meta');

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('google')}
                        className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'google'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Google Ads
                    </button>
                    <button
                        onClick={() => setActiveTab('meta')}
                        className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'meta'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Meta Ads
                    </button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'google' ? googleContent : metaContent}
            </div>
        </div>
    );
};

export default AdCopyEditor;