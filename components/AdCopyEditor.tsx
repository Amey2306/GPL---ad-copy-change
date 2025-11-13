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
    if (typeof field !== 'string') {
        return null;
    }
    const lowerField = field.toLowerCase();
    if (lowerField.includes('headline')) return 30;
    if (lowerField.includes('description')) return 90;
    return null;
}

const HighlightedText: React.FC<{ originalText: string; updatedText: string }> = ({ originalText, updatedText }) => {
    const originalParts = originalText.split(/(\s+)/);
    const updatedParts = updatedText.split(/(\s+)/);

    return (
        <p className="mt-1 text-cyan-300 font-medium leading-relaxed">
            {updatedParts.map((part, index) => {
                if (part !== originalParts[index]) {
                    return (
                        <span key={index} className="bg-cyan-500/20 rounded-sm px-0.5">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </p>
    );
};


const AdCopyCard: React.FC<{ title: string, copy: AdCopy[], isUpdated?: boolean, delay?: number, originalCopy?: AdCopy[] }> = ({ title, copy, isUpdated = false, delay = 0, originalCopy }) => (
    <div 
        className={`bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors relative overflow-hidden animate-fade-in-slide-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {isUpdated && <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ filter: 'drop-shadow(0 0 4px var(--color-accent-glow))' }}></div>}
        <h4 className="text-md font-semibold text-gray-200 mb-3">{title}</h4>
        <div className="space-y-3">
            {copy.map((ad, index) => {
                const charLimit = getCharLimit(ad.field);
                const isOverLimit = charLimit ? ad.text.length > charLimit : false;
                
                const originalAd = originalCopy?.find(o => o.field === ad.field);

                return (
                    <div key={index} className="text-sm p-3 rounded-md bg-gray-900/70 border border-gray-700">
                        <div className="flex justify-between items-baseline">
                             <p className="font-semibold text-xs text-gray-400 uppercase tracking-wider">{ad.field}</p>
                             {charLimit && (
                                <span className={`text-xs font-mono font-medium ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
                                    {ad.text.length}/{charLimit}
                                </span>
                            )}
                        </div>
                        {isUpdated && originalAd && !isOverLimit ? (
                            <HighlightedText originalText={originalAd.text} updatedText={ad.text} />
                        ) : (
                             <p className={`mt-1 ${isUpdated ? 'text-cyan-300 font-medium' : 'text-gray-200'}`}>{ad.text}</p>
                        )}
                    </div>
                )
            })}
            {copy.length === 0 && <p className="text-sm text-gray-500 italic">No ad copy provided.</p>}
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
            <AdCopyCard 
                title={`Updated Suggestions`} 
                copy={updated} 
                isUpdated 
                delay={200}
                originalCopy={original}
            />
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
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
            <div className="flex-shrink-0 border-b border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-2">
                    <button
                        onClick={() => setActiveTab('google')}
                        className={`whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm transition-colors ${
                            activeTab === 'google'
                                ? 'border-b-2 border-sky-400 text-sky-300 bg-gray-900/30'
                                : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                    >
                        Google Ads
                    </button>
                    <button
                        onClick={() => setActiveTab('meta')}
                        className={`whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm transition-colors ${
                            activeTab === 'meta'
                                ? 'border-b-2 border-sky-400 text-sky-300 bg-gray-900/30'
                                : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
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