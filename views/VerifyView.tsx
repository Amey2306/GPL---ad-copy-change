
import React, { useState } from 'react';
import { Project, VerificationResult as VerificationResultType, AdCopy } from '../types';
import * as geminiService from '../services/geminiService';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import VerificationResultDisplay from '../components/VerificationResult';

interface VerifyViewProps {
    project: Project | null;
    creativeFile: File | null;
    analysis: string;
    updatedGoogleAds: AdCopy[];
    updatedMetaAds: AdCopy[];
    onBack: () => void;
    onExport: () => void;
    addLog: (project: string, description: string) => void;
}

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const VerifyView: React.FC<VerifyViewProps> = ({ 
    project, 
    creativeFile, 
    analysis, 
    onBack, 
    onExport,
    addLog
}) => {
    const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
    const [verificationResults, setVerificationResults] = useState<VerificationResultType[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!project || !creativeFile) return null;

    const imageUrl = URL.createObjectURL(creativeFile);

    const handleLinkToggle = (url: string) => {
        setSelectedLinks(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    const handleVerify = async () => {
        if (selectedLinks.length === 0) return;
        setIsVerifying(true);
        setError(null);
        setVerificationResults([]);

        const results: VerificationResultType[] = [];
        
        for (const url of selectedLinks) {
            const linkName = project.links.find(l => l.url === url)?.name || url;
            try {
                const result = await geminiService.verifyUrl(url, analysis);
                results.push({ ...result, url, name: linkName });
            } catch (e: any) {
                results.push({ url, name: linkName, verified: false, reason: e.message, error: true });
                setError(e.message);
            }
        }
        
        setVerificationResults(results);
        setIsVerifying(false);
        if (project) {
            addLog(project.name, `Verification run for ${results.length} URLs.`);
        }
    };

    return (
        <div className="w-full p-4 sm:p-8 bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Verify & Export</h1>
                <p className="text-slate-500 mt-2">Verify that the approved changes are live on the project websites before exporting.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ImagePreview imageUrl={imageUrl} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">1. Select URLs to Verify</h3>
                        <div className="space-y-3">
                            {project.links.map(link => (
                                <label key={link.url} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedLinks.includes(link.url)}
                                        onChange={() => handleLinkToggle(link.url)}
                                    />
                                    <span className="ml-3 text-sm font-medium text-slate-700">{link.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleVerify}
                            disabled={selectedLinks.length === 0 || isVerifying}
                            className="w-full mt-4 flex justify-center items-center py-3 px-5 bg-slate-700 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                        >
                            {isVerifying ? <LoadingSpinner /> : null}
                            {isVerifying ? 'Verifying...' : `Verify ${selectedLinks.length} Selected URLs`}
                        </button>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">2. Verification Results</h3>
                        <VerificationResultDisplay results={verificationResults} />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="py-2 px-5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Back to Review
                </button>
                <button
                    onClick={onExport}
                    className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Export Approved Copy
                </button>
            </div>
        </div>
    );
};

export default VerifyView;
