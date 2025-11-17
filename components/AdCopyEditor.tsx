import React from 'react';
import { AdCopy } from '../types';

interface AdCopyTableProps {
    copy: AdCopy[];
    originalCopy?: AdCopy[];
}

const AdCopyTable: React.FC<AdCopyTableProps> = ({ copy, originalCopy }) => {
    if (!copy || copy.length === 0) {
        return <p className="text-sm text-gray-500">No ad copy available.</p>;
    }

    return (
        <div className="space-y-2 text-sm">
            {copy.map((c, i) => {
                const originalText = originalCopy?.find(item => item.field === c.field)?.text;
                const isChanged = originalText !== undefined && originalText !== c.text;
                
                return (
                    <div key={i} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{c.field}</p>
                        <p className={`mt-1 text-gray-200 ${isChanged ? 'text-amber-300' : ''}`}>{c.text}</p>
                    </div>
                );
            })}
        </div>
    );
};

interface AdCopyEditorProps {
    originalGoogleCopy: AdCopy[];
    originalMetaCopy: AdCopy[];
    updatedGoogleCopy: AdCopy[];
    updatedMetaCopy: AdCopy[];
    isGenerated: boolean;
}

const AdCopyEditor: React.FC<AdCopyEditorProps> = ({
    originalGoogleCopy,
    originalMetaCopy,
    updatedGoogleCopy,
    updatedMetaCopy,
    isGenerated,
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Google Ads Section */}
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Google Ads Copy</h3>
                {isGenerated ? (
                    <div className="grid grid-cols-1 gap-4">
                        <AdCopyTable copy={updatedGoogleCopy} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-400 mb-2 text-sm">Original</h4>
                            <AdCopyTable copy={originalGoogleCopy} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-400 mb-2 text-sm">Gemini's Suggestion</h4>
                            <AdCopyTable copy={updatedGoogleCopy} originalCopy={originalGoogleCopy} />
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Ads Section */}
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Meta (Facebook/Instagram) Ads Copy</h3>
                {isGenerated ? (
                    <div className="grid grid-cols-1 gap-4">
                        <AdCopyTable copy={updatedMetaCopy} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-400 mb-2 text-sm">Original</h4>
                            <AdCopyTable copy={originalMetaCopy} />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-400 mb-2 text-sm">Gemini's Suggestion</h4>
                            <AdCopyTable copy={updatedMetaCopy} originalCopy={originalMetaCopy} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdCopyEditor;
