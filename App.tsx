import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import UploadView from './views/UploadView';
import ReviewView from './views/ReviewView';
import VerifyView from './views/VerifyView';
import * as geminiService from './services/geminiService';
import { AdCopy, UploadSource, LogEntry, LogType, Project, AppState, ApprovalEvent } from './types';
import { PROJECTS, INITIAL_GOOGLE_ADS, INITIAL_META_ADS } from './constants';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import LogViewer from './components/LogViewer';
import LinkRepositoryViewer from './components/LinkRepositoryViewer';

const App = () => {
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    
    // Upload state
    const [creativeFile, setCreativeFile] = useState<File | null>(null);
    const [adCopyFile, setAdCopyFile] = useState<File | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Analysis & Generation state
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [originalGoogleAds, setOriginalGoogleAds] = useState<AdCopy[]>(INITIAL_GOOGLE_ADS);
    const [originalMetaAds, setOriginalMetaAds] = useState<AdCopy[]>(INITIAL_META_ADS);
    const [updatedGoogleAds, setUpdatedGoogleAds] = useState<AdCopy[]>([]);
    const [updatedMetaAds, setUpdatedMetaAds] = useState<AdCopy[]>([]);

    // Approval state
    const [approvalHistory, setApprovalHistory] = useState<ApprovalEvent[]>([]);

    // Log & Repo state
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
    const [isLinkRepoOpen, setIsLinkRepoOpen] = useState(false);


    const addLog = (type: LogType, project: string, description: string) => {
        const newLog: LogEntry = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date(),
            type,
            project,
            description,
        };
        setLogs(prev => [newLog, ...prev]);
    };

    const handleAnalyze = async (googleAds: AdCopy[], metaAds: AdCopy[]) => {
        if (!creativeFile) return;
        setIsProcessing(true);
        setError(null);
        setIsGenerated(false);
        setOriginalGoogleAds(googleAds);
        setOriginalMetaAds(metaAds);

        try {
            const adCopyText = [...googleAds, ...metaAds].map(ad => `${ad.field}: ${ad.text}`).join('\n');
            const analysisResult = await geminiService.analyzeCreativeAndCopy(creativeFile, adCopyText);
            setAnalysis(analysisResult);

            const suggestions = await geminiService.updateAdCopy(analysisResult, googleAds, metaAds);
            setUpdatedGoogleAds(suggestions.google);
            setUpdatedMetaAds(suggestions.meta);

            if (selectedProject) {
                addLog(LogType.ANALYSIS, selectedProject.name, 'Analyzed creative and suggested copy updates.');
            }

            setAppState(AppState.REVIEW);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerate = async (source: UploadSource) => {
        if (!creativeFile) return;
        setIsProcessing(true);
        setError(null);
        setIsGenerated(true);

        try {
            const result = await geminiService.generateAdCopiesFromSource(creativeFile, source);
            setAnalysis(result.analysis);
            setUpdatedGoogleAds(result.google);
            setUpdatedMetaAds(result.meta);
            setOriginalGoogleAds([]); // No original copy in this flow
            setOriginalMetaAds([]);

             if (selectedProject) {
                addLog(LogType.GENERATE, selectedProject.name, `Generated new ad copy from ${source.type} source.`);
            }

            setAppState(AppState.REVIEW);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSendForApproval = () => {
        if (selectedProject) {
            addLog(LogType.APPROVAL, selectedProject.name, 'Sent ad copy for approval.');
        }
        setApprovalHistory([{ status: 'Sent', timestamp: new Date() }]);
        setAppState(AppState.APPROVAL_PENDING);
    };

    const handleMarkAsApproved = () => {
         if (selectedProject) {
            addLog(LogType.APPROVAL, selectedProject.name, 'Ad copy marked as approved.');
        }
        setApprovalHistory(prev => [...prev, { status: 'Approved', timestamp: new Date() }]);
        setAppState(AppState.APPROVED);
    };

    const handleProceedToVerify = () => {
        setAppState(AppState.VERIFY);
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AdGen';
        workbook.created = new Date();

        const createSheet = (sheetName: string, data: AdCopy[]) => {
            const sheet = workbook.addWorksheet(sheetName);
            sheet.columns = [
                { header: 'Field', key: 'field', width: 20 },
                { header: 'Text', key: 'text', width: 80 }
            ];
            sheet.addRows(data);
        };
        
        createSheet('Updated Google Ads', updatedGoogleAds);
        createSheet('Updated Meta Ads', updatedMetaAds);

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `${selectedProject?.name || 'AdCopy'}_Updated_${new Date().toISOString().split('T')[0]}.xlsx`);

         if (selectedProject) {
            addLog(LogType.DOWNLOAD, selectedProject.name, 'Exported approved ad copy to Excel.');
        }
    };

    const resetState = () => {
        setAppState(AppState.UPLOAD);
        setCreativeFile(null);
        setAdCopyFile(null);
        setError(null);
        setIsProcessing(false);
        setAnalysis('');
        setUpdatedGoogleAds([]);
        setUpdatedMetaAds([]);
        setSelectedProject(null);
        setApprovalHistory([]);
    };

    const renderCurrentView = () => {
        switch (appState) {
            case AppState.UPLOAD:
                return <UploadView 
                    onAnalyze={handleAnalyze} 
                    onGenerate={handleGenerate}
                    isAnalyzing={isProcessing}
                    creativeFile={creativeFile}
                    onCreativeFileChange={setCreativeFile}
                    adCopyFile={adCopyFile}
                    onAdCopyFileChange={setAdCopyFile}
                    error={error}
                    onClearError={() => setError(null)}
                    onError={setError}
                    projects={PROJECTS}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                />;
            case AppState.REVIEW:
            case AppState.APPROVAL_PENDING:
            case AppState.APPROVED:
                return <ReviewView 
                    appState={appState}
                    creativeFile={creativeFile}
                    analysis={analysis}
                    originalGoogleAds={originalGoogleAds}
                    originalMetaAds={originalMetaAds}
                    updatedGoogleAds={updatedGoogleAds}
                    updatedMetaAds={updatedMetaAds}
                    onSendForApproval={handleSendForApproval}
                    onMarkAsApproved={handleMarkAsApproved}
                    onProceedToVerify={handleProceedToVerify}
                    onBack={() => setAppState(AppState.UPLOAD)}
                    isGenerated={isGenerated}
                    approvalHistory={approvalHistory}
                />;
            case AppState.VERIFY:
                return <VerifyView 
                    project={selectedProject}
                    creativeFile={creativeFile}
                    analysis={analysis}
                    updatedGoogleAds={updatedGoogleAds}
                    updatedMetaAds={updatedMetaAds}
                    onBack={() => setAppState(AppState.APPROVED)}
                    onExport={handleExport}
                    addLog={(project, description) => addLog(LogType.VERIFICATION, project, description)}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <Sidebar appState={appState} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {renderCurrentView()}
            </main>
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                 <button
                    onClick={() => setIsLinkRepoOpen(true)}
                    className="p-2.5 bg-white rounded-full shadow-md text-slate-600 hover:bg-slate-100 transition-colors"
                    title="View Link Repository"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </button>
                <button
                    onClick={() => setIsLogViewerOpen(true)}
                    className="p-2.5 bg-white rounded-full shadow-md text-slate-600 hover:bg-slate-100 transition-colors"
                    title="View Activity Log"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
                 <button
                    onClick={resetState}
                    className="p-2.5 bg-white rounded-full shadow-md text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Start Over"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
                    </svg>
                </button>
            </div>
             <LogViewer 
                isOpen={isLogViewerOpen} 
                onClose={() => setIsLogViewerOpen(false)} 
                logs={logs}
                projects={PROJECTS}
            />
            <LinkRepositoryViewer
                isOpen={isLinkRepoOpen}
                onClose={() => setIsLinkRepoOpen(false)}
                projects={PROJECTS}
            />
        </div>
    );
};

export default App;