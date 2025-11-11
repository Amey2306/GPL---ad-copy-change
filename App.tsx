import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './views/UploadView';
import ReviewView from './views/ReviewView';
import VerifyView from './views/VerifyView';
import { AppState, AdCopy, VerificationResult, UploadSource, Project } from './types';
import { INITIAL_GOOGLE_ADS, INITIAL_META_ADS, PROJECTS } from './constants';
import * as geminiService from './services/geminiService';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';


function App() {
    const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
    const [creativeFile, setCreativeFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [originalGoogleAds, setOriginalGoogleAds] = useState<AdCopy[]>(INITIAL_GOOGLE_ADS);
    const [originalMetaAds, setOriginalMetaAds] = useState<AdCopy[]>(INITIAL_META_ADS);
    const [updatedGoogleAds, setUpdatedGoogleAds] = useState<AdCopy[]>([]);
    const [updatedMetaAds, setUpdatedMetaAds] = useState<AdCopy[]>([]);
    const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleReset = useCallback(() => {
        setAppState(AppState.INITIAL);
        setCreativeFile(null);
        setAnalysis('');
        setOriginalGoogleAds(INITIAL_GOOGLE_ADS);
        setOriginalMetaAds(INITIAL_META_ADS);
        setUpdatedGoogleAds([]);
        setUpdatedMetaAds([]);
        setVerificationResults([]);
        setIsGenerated(false);
        setError(null);
        setSelectedProject(null);
    }, []);

    const handleAnalyze = async (imageFile: File, googleAds: AdCopy[], metaAds: AdCopy[]) => {
        if (!imageFile) return;
        setAppState(AppState.ANALYZING);
        setCreativeFile(imageFile);
        setOriginalGoogleAds(googleAds);
        setOriginalMetaAds(metaAds);
        setError(null);
        
        try {
            const adCopyText = `Google Ads:\n${googleAds.map(ad => `${ad.field}: ${ad.text}`).join('\n')}\n\nMeta Ads:\n${metaAds.map(ad => `${ad.field}: ${ad.text}`).join('\n')}`;
            const analysisResult = await geminiService.analyzeCreativeAndCopy(imageFile, adCopyText);
            setAnalysis(analysisResult);
            const adCopyResult = await geminiService.generateAdCopy(analysisResult, googleAds, metaAds);
            setUpdatedGoogleAds(adCopyResult.google);
            setUpdatedMetaAds(adCopyResult.meta);
            setAppState(AppState.ANALYSIS_COMPLETE);
        } catch (e) {
            console.error(e);
            setError('Failed to analyze creative. Please try again.');
            setAppState(AppState.INITIAL);
        }
    };
    
    const handleGenerate = async (imageFile: File, source: UploadSource) => {
        if (!imageFile) return;
        setAppState(AppState.ANALYZING);
        setCreativeFile(imageFile);
        setIsGenerated(true);
        setError(null);
        try {
            const result = await geminiService.generateAdCopiesFromSource(imageFile, source);
            setAnalysis(result.analysis);
            setUpdatedGoogleAds(result.google);
            setUpdatedMetaAds(result.meta);
            setAppState(AppState.ANALYSIS_COMPLETE);
        } catch(e) {
            console.error(e);
            setError('Failed to generate ad copy. Please try again.');
            setAppState(AppState.INITIAL);
        }
    };

    const handleSendForApproval = () => {
        setAppState(AppState.APPROVAL_SENT);
        // Simulate sending for approval
    };
    
    const handleVerifyChanges = async () => {
        if (!analysis || !selectedProject) return;
        setAppState(AppState.VERIFYING_CHANGES);
        setVerificationResults([]);
        setError(null);
        
        const linksToVerify = selectedProject.links;

        const verificationPromises = linksToVerify.map(link =>
            geminiService.verifyUrl(link.url, analysis)
                .then(result => ({ url: link.url, verified: result.verified, reason: result.reason }))
                .catch(error => ({
                    url: link.url,
                    verified: false,
                    reason: 'Failed to verify URL.',
                    error: error.message,
                }))
        );

        const results = await Promise.all(verificationPromises);
        setVerificationResults(results);
        setAppState(AppState.VERIFICATION_COMPLETE);
    };

    const handleDownloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        
        const createSheet = (sheetName: string, data: AdCopy[]) => {
            const sheet = workbook.addWorksheet(sheetName);
            sheet.columns = [
                { header: 'Field', key: 'field', width: 20 },
                { header: 'Text', key: 'text', width: 80 },
            ];
            sheet.addRows(data);
        };

        if (isGenerated) {
            createSheet('Generated Google Ads', updatedGoogleAds);
            createSheet('Generated Meta Ads', updatedMetaAds);
        } else {
            createSheet('Original Google Ads', originalGoogleAds);
            createSheet('Updated Google Ads', updatedGoogleAds);
            createSheet('Original Meta Ads', originalMetaAds);
            createSheet('Updated Meta Ads', updatedMetaAds);
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `AdCopy_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const renderCurrentView = () => {
        switch (appState) {
            case AppState.INITIAL:
                return <UploadView 
                    onAnalyze={handleAnalyze} 
                    onGenerate={handleGenerate} 
                    error={error} 
                    onClearError={() => setError(null)}
                    onError={setError}
                    projects={PROJECTS}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />;
            
            case AppState.ANALYZING:
            case AppState.ANALYSIS_COMPLETE:
                if (!creativeFile || !analysis) {
                    handleReset(); // Should not happen, but as a safeguard
                    return null;
                }
                return (
                    <ReviewView
                        imageUrl={URL.createObjectURL(creativeFile)}
                        analysis={analysis}
                        originalGoogleAds={originalGoogleAds}
                        originalMetaAds={originalMetaAds}
                        updatedGoogleAds={updatedGoogleAds}
                        updatedMetaAds={updatedMetaAds}
                        onSendForApproval={handleSendForApproval}
                        onDownloadExcel={handleDownloadExcel}
                        isGenerated={isGenerated}
                        isApproved={appState === AppState.APPROVAL_SENT}
                    />
                );

            case AppState.APPROVAL_SENT:
            case AppState.VERIFYING_CHANGES:
            case AppState.VERIFICATION_COMPLETE:
                 if (!creativeFile || !analysis || !selectedProject) {
                    handleReset(); // Safeguard
                    return null;
                }
                return (
                    <VerifyView
                        imageUrl={URL.createObjectURL(creativeFile)}
                        analysis={analysis}
                        results={verificationResults}
                        isLoading={appState === AppState.VERIFYING_CHANGES}
                        onVerify={handleVerifyChanges}
                        project={selectedProject}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <Sidebar appState={appState} onReset={handleReset} />
            <main className="flex-1 h-screen overflow-hidden">
                {renderCurrentView()}
            </main>
        </div>
    );
}

export default App;