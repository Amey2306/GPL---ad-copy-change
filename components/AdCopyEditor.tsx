import React, { useState } from 'react';
import { AdCopy } from '../types';

interface AdCopyEditorProps {
    originalGoogleCopy: AdCopy[];
    originalMetaCopy: AdCopy[];
    updatedGoogleCopy: AdCopy[];
    updatedMetaCopy: AdCopy[];
    isGenerated: boolean;
}

const getCharLimit = (field: string): number | null => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes('headline')) return 30;
    if (lowerField.includes('description')) return 90;
    return null;
}

const AdCopyCard: React.FC<{ title: string, copy: AdCopy[], isUpdated?: boolean, delay?: number }> = ({ title, copy, isUpdated = false, delay = 0 }) => (
    <div 
        className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden animate-fade-in-slide-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {isUpdated && <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>}
        <h4 className="text-md font-semibold text-slate-700 mb-3">{title}</h4>
        <div className="space-y-3">
            {copy.map((ad, index) => {
                const charLimit = getCharLimit(ad.field);
                const isOverLimit = charLimit ? ad.text.length > charLimit : false;

                return (
                    <div key={index} className="text-sm p-3 rounded-md bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-baseline">
                             <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider">{ad.field}</p>
                             {charLimit && (
                                <span className={`text-xs font-mono font-medium ${isOverLimit ? 'text-red-500' : 'text-slate-400'}`}>
                                    {ad.text.length}/{charLimit}
                                </span>
                            )}
                        </div>
                        <p className={`mt-1 ${isUpdated ? 'text-indigo-800 font-medium' : 'text-slate-800'}`}>{ad.text}</p>
                    </div>
                )
            })}
            {copy.length === 0 && <p className="text-sm text-slate-500 italic">No ad copy provided.</p>}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdCopyCard title={`Original ${platform} Copy`} copy={original} delay={100} />
            <AdCopyCard title={`Updated Suggestions`} copy={updated} isUpdated delay={200} />
        </div>
    );
    
    const renderGenerated = (copy: AdCopy[], platform: string) => (
         <AdCopyCard title={`Generated ${platform} Copy`} copy={copy} isUpdated delay={100} />
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
                <nav className="-mb-px flex space-x-2">
                    <button
                        onClick={() => setActiveTab('google')}
                        className={`whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm transition-colors ${
                            activeTab === 'google'
                                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        Google Ads
                    </button>
                    <button
                        onClick={() => setActiveTab('meta')}
                        className={`whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm transition-colors ${
                            activeTab === 'meta'
                                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        Meta Ads
                    </button>
                </nav>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                {activeTab === 'google' ? googleContent : metaContent}
            </div>
        </div>
    );
};

export default AdCopyEditor;