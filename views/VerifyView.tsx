import React, { useState, useMemo } from 'react';
import { Project, VerificationResult as VerificationResultType, AdCopy, ProjectLink } from '../types';
import * as geminiService from '../services/geminiService';
import { exportAdCopyToExcel } from '../utils/exportUtils';
import ImagePreview from '../components/ImagePreview';
import AnalysisResult from '../components/AnalysisResult';
import VerificationResultDisplay from '../components/VerificationResult';

interface VerifyViewProps {
    project: Project | null;
    creativeFiles: File[];
    analysis: string;
    updatedGoogleAds: AdCopy[];
    updatedMetaAds: AdCopy[];
    onBack: () => void;
    addLog: (project: string, description: string) => void;
}

const LoadingSpinner = () => <div className="holo-spinner -ml-1 mr-2"></div>;

const CATEGORY_MAP: { [key: string]: string } = {
  overviewPage: 'Overview Page Link',
  landingPage: 'Landing Page Link',
  teaserLandingPage: 'Teaser Landing Page',
  digitalCollaterals: 'Digital Collaterals Link',
  alternateCollaterals: 'Alternate Collaterals Link',
  eoiPortal: 'EOI Portal Page',
  internationalPage: 'International Page',
  ppLandingPage: 'PP Landing Page',
  ppLandingPageNew: 'PP Landing Page New',
  rcpLandingPage: 'RCP Landing Page',
  eoiWindow: 'EOI Window',
};

const formatLinkCategory = (key: string): string => {
    return CATEGORY_MAP[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};


const VerifyView: React.FC<VerifyViewProps> = ({ 
    project, 
    creativeFiles, 
    analysis, 
    updatedGoogleAds,
    updatedMetaAds,
    onBack, 
    addLog
}) => {
    const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
    const [verificationResults, setVerificationResults] = useState<VerificationResultType[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationProgress, setVerificationProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const availableLinks = useMemo((): ProjectLink[] => {
        if (!project?.links) return [];
        return Object.entries(project.links)
            .filter(([, url]) => !!url)
            .map(([category, url]) => ({
                name: formatLinkCategory(category),
                url: url as string,
            }));
    }, [project]);

    if (!project || creativeFiles.length === 0) return null;

    const imageUrls = creativeFiles.map(file => URL.createObjectURL(file));

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
        setVerificationProgress(0);

        for (let i = 0; i < selectedLinks.length; i++) {
            const url = selectedLinks[i];
            setVerificationProgress(i + 1);

            const linkName = availableLinks.find(l => l.url === url)?.name || url;
            try {
                const result = await geminiService.verifyUrl(url, analysis);
                setVerificationResults(prev => [...prev, { ...result, url, name: linkName }]);
            } catch (e: any) {
                setVerificationResults(prev => [...prev, { url, name: linkName, verified: false, reason: e.message, error: true }]);
                setError(e.message);
            }

            if (i < selectedLinks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
        }
        
        setIsVerifying(false);
        if (project) {
            addLog(project.name, `Verification run for ${selectedLinks.length} URLs.`);
        }
    };

    const handleExport = () => {
        if (project) {
            exportAdCopyToExcel(updatedGoogleAds, updatedMetaAds, project.name);
            addLog(project.name, "Approved ad copy has been exported.");
        } else {
            alert("Cannot export copy without a selected project.");
        }
    };

    return (
        <div className="w-full p-4 sm:p-8 bg-gray-900 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Verify & Export</h1>
                <p className="text-gray-400 mt-2">Verify that the approved changes are live on the project websites before exporting.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ImagePreview imageUrls={imageUrls} isCompact />
                    <AnalysisResult analysis={analysis} isCompact />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-100 mb-3">1. Select URLs to Verify</h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            {availableLinks.map(link => (
                                <label key={link.url} className="flex items-center p-3 bg-gray-900/50 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-sky-500 focus:ring-sky-500"
                                        checked={selectedLinks.includes(link.url)}
                                        onChange={() => handleLinkToggle(link.url)}
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-300">{link.name}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={handleVerify}
                            disabled={selectedLinks.length === 0 || isVerifying}
                            className="w-full mt-4 flex justify-center items-center py-3 px-5 bg-gray-700 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                        >
                            {isVerifying ? <LoadingSpinner /> : null}
                            {isVerifying ? `Verifying... (${verificationProgress}/${selectedLinks.length})` : `Verify ${selectedLinks.length} Selected URLs`}
                        </button>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-100 mb-3">2. Verification Results</h3>
                        <VerificationResultDisplay results={verificationResults} />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="py-2 px-5 bg-gray-700 text-gray-200 font-semibold rounded-lg shadow-sm border border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Back to Review
                </button>
                <button
                    onClick={handleExport}
                    className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-400 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Export Approved Copy
                </button>
            </div>
        </div>
    );
};

export default VerifyView;