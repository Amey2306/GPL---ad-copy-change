import React from 'react';
import { AdCopy } from '../types';
import { GOOGLE_ADS_CHAR_LIMITS } from '../constants';

interface AdCopyTableProps {
    copy: AdCopy[];
    originalCopy?: AdCopy[];
    platform: 'google' | 'meta';
}

const AdCopyTable: React.FC<AdCopyTableProps> = ({ copy, originalCopy, platform }) => {
    if (!copy || copy.length === 0) {
        return <p className="text-sm text-gray-500">No ad copy available.</p>;
    }

    return (
        <div className="space-y-2 text-sm">
            {copy.map((c, i) => {
                const originalText = originalCopy?.find(item => item.field === c.field)?.text;
                const isChanged = originalText !== undefined && originalText !== c.text;
                
                const limit = platform === 'google' ? GOOGLE_ADS_CHAR_LIMITS[c.field] : undefined;
                const count = c.text.length;
                const isOverLimit = limit !== undefined && count > limit;

                return (
                    <div key={i} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-400 text-xs uppercase tracking-wider">{c.field}</p>
                            {limit !== undefined && (
                                <div className="relative group flex items-center">
                                    <span className={`text-xs font-mono cursor-help ${isOverLimit ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                                        {count}/{limit}
                                    </span>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md border border-gray-600 shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        Current: {count} / Max: {limit}
                                        <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                                            <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className={`mt-1 text-gray-200 ${isChanged ? 'text-amber-300' : ''} ${isOverLimit ? 'text-red-400' : ''}`}>{c.text}</p>
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
                        <AdCopyTable copy={updatedGoogleCopy} platform="google" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-400 mb-2 text-sm">Original</h4>
                            <AdCopyTable copy={originalGoogleCopy} platform="google" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-400 mb-2 text-sm">Gemini's Suggestion</h4>
                            <AdCopyTable copy={updatedGoogleCopy} originalCopy={originalGoogleCopy} platform="google" />
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Ads Section */}
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Meta (Facebook/Instagram) Ads Copy</h3>
                {isGenerated ? (
                    <div className="grid grid-cols-1 gap-4">
                        <AdCopyTable copy={updatedMetaCopy} platform="meta" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-400 mb-2 text-sm">Original</h4>
                            <AdCopyTable copy={originalMetaCopy} platform="meta" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sky-400 mb-2 text-sm">Gemini's Suggestion</h4>
                            <AdCopyTable copy={updatedMetaCopy} originalCopy={originalMetaCopy} platform="meta" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdCopyEditor;