import React, { useState } from 'react';
import { AppState, Project, AdCopy, BrandManager, ApprovalEvent, ActivityLog } from './types';
import { INITIAL_GOOGLE_ADS, INITIAL_META_ADS, PROJECTS } from './constants';
import * as geminiService from './services/geminiService';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadView from './views/UploadView';
import ReviewView from './views/ReviewView';
import VerifyView from './views/VerifyView';
import LogViewer from './components/LogViewer';
import LinkRepositoryViewer from './components/LinkRepositoryViewer';
import AddProjectModal from './components/AddProjectModal';
import BrandManagerModal from './components/BrandManagerModal';
import ConfirmationModal from './components/ConfirmationModal';

// Mock data generation
const initialProjects: Project[] = PROJECTS.map((p, index) => ({
    ...p,
    id: `proj-${index + 1}`,
}));

const initialBrandManagers: BrandManager[] = [
    { id: 'bm-1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '9876543210', projectIds: ['proj-1', 'proj-2', 'proj-3'] },
    { id: 'bm-2', name: 'Saanvi Patel', email: 'saanvi.patel@example.com', phone: '9876543211', projectIds: ['proj-4', 'proj-5'] },
    { id: 'bm-3', name: 'Vivaan Singh', email: 'vivaan.singh@example.com', phone: '9876543212', projectIds: ['proj-1', 'proj-6', 'proj-7'] },
    { id: 'bm-4', name: 'Diya Gupta', email: 'diya.gupta@example.com', phone: '9876543213', projectIds: ['proj-31', 'proj-32', 'proj-33'] },
];

function App() {
    // Core state
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [brandManagers, setBrandManagers] = useState<BrandManager[]>(initialBrandManagers);

    // Workflow specific state
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedBrandManager, setSelectedBrandManager] = useState<BrandManager | null>(null);
    const [creativeFiles, setCreativeFiles] = useState<File[]>([]);
    const [adCopyFile, setAdCopyFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [originalGoogleAds, setOriginalGoogleAds] = useState<AdCopy[]>([]);
    const [originalMetaAds, setOriginalMetaAds] = useState<AdCopy[]>([]);
    const [updatedGoogleAds, setUpdatedGoogleAds] = useState<AdCopy[]>([]);
    const [updatedMetaAds, setUpdatedMetaAds] = useState<AdCopy[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);
    const [workflowType, setWorkflowType] = useState<'update' | 'generate'>('update');
    const [approvalHistory, setApprovalHistory] = useState<ApprovalEvent[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
    const [isLinkRepoOpen, setIsLinkRepoOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [isBrandManagerModalOpen, setIsBrandManagerModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationProps, setConfirmationProps] = useState({ onConfirm: () => {}, title: '', message: '' });

    // Utility Functions
    const addLog = (project: string, description: string) => {
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            project,
            description,
            brandManager: selectedBrandManager || undefined,
        };
        setActivityLogs(prev => [newLog, ...prev]);
    };

    const resetWorkflow = () => {
        setAppState(AppState.UPLOAD);
        setSelectedProject(null);
        setSelectedBrandManager(null);
        setCreativeFiles([]);
        setAdCopyFile(null);
        setAnalysis('');
        setOriginalGoogleAds([]);
        setOriginalMetaAds([]);
        setUpdatedGoogleAds([]);
        setUpdatedMetaAds([]);
        setIsGenerated(false);
        setApprovalHistory([]);
        setWorkflowType('update');
    };

    // Handlers
    const handleAnalyze = async (googleAds: AdCopy[], metaAds: AdCopy[]) => {
        if (!selectedProject || creativeFiles.length === 0) return;
        setIsLoading(true);
        setAppState(AppState.GENERATING);
        setOriginalGoogleAds(googleAds);
        setOriginalMetaAds(metaAds);
        setIsGenerated(false);

        try {
            addLog(selectedProject.name, 'Started creative analysis.');
            const analysisResult = await geminiService.analyzeCreatives(selectedProject, creativeFiles, googleAds, metaAds);
            setAnalysis(analysisResult);
            addLog(selectedProject.name, 'Creative analysis completed.');

            addLog(selectedProject.name, 'Started ad copy update.');
            const updatedCopy = await geminiService.updateAdCopy(selectedProject, analysisResult, googleAds, metaAds);
            setUpdatedGoogleAds(updatedCopy.googleAds);
            setUpdatedMetaAds(updatedCopy.metaAds);
            addLog(selectedProject.name, 'Ad copy update completed.');
            
            setAppState(AppState.REVIEW);
        } catch (error) {
            console.error(error);
            alert('An error occurred during analysis. Please check the console.');
            resetWorkflow();
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerate = async () => {
        if (!selectedProject || creativeFiles.length === 0) return;
        setIsLoading(true);
        setAppState(AppState.GENERATING);
        setOriginalGoogleAds(INITIAL_GOOGLE_ADS); // Use initial as placeholder
        setOriginalMetaAds(INITIAL_META_ADS);
        setIsGenerated(true);

        try {
            addLog(selectedProject.name, 'Started creative analysis for new copy generation.');
            const analysisResult = await geminiService.analyzeCreatives(selectedProject, creativeFiles);
            setAnalysis(analysisResult);
            addLog(selectedProject.name, 'Creative analysis completed.');

            addLog(selectedProject.name, 'Started new ad copy generation.');
            const newCopy = await geminiService.generateAdCopy(selectedProject, analysisResult);
            setUpdatedGoogleAds(newCopy.googleAds);
            setUpdatedMetaAds(newCopy.metaAds);
            addLog(selectedProject.name, 'New ad copy generation completed.');

            setAppState(AppState.REVIEW);
        } catch (error) {
            console.error(error);
            alert('An error occurred during generation. Please check the console.');
            resetWorkflow();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendForApproval = () => {
        if (!selectedProject || !selectedBrandManager) return;
        setApprovalHistory([{ status: 'Sent', timestamp: new Date() }]);
        setAppState(AppState.APPROVAL_PENDING);
        addLog(selectedProject.name, `Ad copy sent to ${selectedBrandManager.name} for approval.`);
    };

    const handleMarkAsApproved = () => {
        if (!selectedProject) return;
        setApprovalHistory(prev => [...prev, { status: 'Approved', timestamp: new Date() }]);
        setAppState(AppState.APPROVED);
        addLog(selectedProject.name, `Ad copy marked as approved.`);
    };
    
    // Project & Manager CRUD
    const handleSaveProject = (projectData: Project | Omit<Project, 'id'>) => {
        if ('id' in projectData) { // Update
            setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
            addLog(projectData.name, 'Project details updated.');
        } else { // Add
            const newProject: Project = { ...projectData, id: `proj-${Date.now()}` };
            setProjects(prev => [...prev, newProject]);
            addLog(newProject.name, 'New project added.');
        }
    };

    const handleDeleteProject = (project: Project) => {
        setConfirmationProps({
            onConfirm: () => {
                setProjects(prev => prev.filter(p => p.id !== project.id));
                 addLog(project.name, `Project "${project.name}" deleted.`);
                setIsConfirmationModalOpen(false);
            },
            title: 'Delete Project',
            message: `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`
        });
        setIsConfirmationModalOpen(true);
    };

    const handleAddManager = (manager: Omit<BrandManager, 'id'>) => {
        const newManager = { ...manager, id: `bm-${Date.now()}` };
        setBrandManagers(prev => [...prev, newManager]);
    };

    const handleUpdateManager = (manager: BrandManager) => {
        setBrandManagers(prev => prev.map(m => m.id === manager.id ? manager : m));
    };

    const handleDeleteManager = (managerId: string) => {
        const manager = brandManagers.find(m => m.id === managerId);
        if (!manager) return;
        setConfirmationProps({
            onConfirm: () => {
                setBrandManagers(prev => prev.filter(m => m.id !== managerId));
                setIsConfirmationModalOpen(false);
            },
            title: 'Delete Brand Manager',
            message: `Are you sure you want to delete "${manager.name}"?`
        });
        setIsConfirmationModalOpen(true);
    };
    
    const renderContent = () => {
        if (isLoading || appState === AppState.GENERATING) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
                    <div className="holo-loader"></div>
                    <p className="text-xl font-semibold text-gray-300 mt-6">Gemini is thinking...</p>
                    <p className="text-gray-500 mt-2">Analyzing creatives and crafting copy.</p>
                </div>
            )
        }
        
        switch (appState) {
            case AppState.UPLOAD:
                return <UploadView
                    projects={projects}
                    brandManagers={brandManagers}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    selectedBrandManager={selectedBrandManager}
                    setSelectedBrandManager={setSelectedBrandManager}
                    onAnalyze={handleAnalyze}
                    onGenerate={handleGenerate}
                    onAddProject={() => { setProjectToEdit(null); setIsAddProjectModalOpen(true); }}
                    creativeFiles={creativeFiles}
                    setCreativeFiles={setCreativeFiles}
                    adCopyFile={adCopyFile}
                    setAdCopyFile={setAdCopyFile}
                    workflowType={workflowType}
                    setWorkflowType={setWorkflowType}
                />;
            case AppState.REVIEW:
            case AppState.APPROVAL_PENDING:
            case AppState.APPROVED:
                return <ReviewView
                    appState={appState}
                    creativeFiles={creativeFiles}
                    analysis={analysis}
                    originalGoogleAds={originalGoogleAds}
                    originalMetaAds={originalMetaAds}
                    updatedGoogleAds={updatedGoogleAds}
                    updatedMetaAds={updatedMetaAds}
                    onSendForApproval={handleSendForApproval}
                    onMarkAsApproved={handleMarkAsApproved}
                    onProceedToVerify={() => setAppState(AppState.VERIFY)}
                    onBack={resetWorkflow}
                    isGenerated={isGenerated}
                    approvalHistory={approvalHistory}
                    brandManager={selectedBrandManager}
                />;
            case AppState.VERIFY:
                 return <VerifyView
                    project={selectedProject}
                    creativeFiles={creativeFiles}
                    analysis={analysis}
                    updatedGoogleAds={updatedGoogleAds}
                    updatedMetaAds={updatedMetaAds}
                    onBack={() => setAppState(AppState.APPROVED)}
                    onExport={() => alert('Export functionality not implemented.')}
                    addLog={(proj, desc) => addLog(proj, desc)}
                 />;
            default:
                return null;
        }
    }

    return (
        <div className="h-screen w-screen flex bg-gray-900 text-white font-sans overflow-hidden">
            <style>{`
                :root {
                    --color-accent: 67, 181, 255;
                    --color-accent-glow: rgba(67, 181, 255, 0.5);
                    --color-success: 22, 163, 74;
                    --color-warning: 245, 158, 11;
                    --color-danger: 239, 68, 68;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.5); border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.6); }

                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-slide-up { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-slide-up { animation: fade-in-slide-up 0.4s ease-out forwards; }

                /* Loader and Spinner */
                .holo-loader { width: 60px; height: 60px; border-radius: 50%; background: transparent; position: relative; border: 2px solid rgba(var(--color-accent), 0.2); }
                .holo-loader::before, .holo-loader::after { content: ''; position: absolute; border-radius: 50%; }
                .holo-loader::before { top: -2px; left: -2px; right: -2px; bottom: -2px; border: 2px solid transparent; border-top-color: rgb(var(--color-accent)); border-right-color: rgb(var(--color-accent)); animation: spin 1.5s linear infinite; }
                .holo-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>

            <Sidebar appState={appState} />
            <main className="flex-1 flex flex-col">
                <Header 
                    onNewWorkflow={resetWorkflow}
                    onViewLogs={() => setIsLogViewerOpen(true)}
                    onViewLinks={() => setIsLinkRepoOpen(true)}
                    onViewManagers={() => setIsBrandManagerModalOpen(true)}
                />
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
            </main>

            <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} logs={activityLogs} />
            <LinkRepositoryViewer
                isOpen={isLinkRepoOpen}
                onClose={() => setIsLinkRepoOpen(false)}
                projects={projects}
                onAddProject={() => { setProjectToEdit(null); setIsAddProjectModalOpen(true); }}
                onEditProject={(p) => { setProjectToEdit(p); setIsAddProjectModalOpen(true); }}
                onDeleteProject={handleDeleteProject}
            />
            <AddProjectModal
                isOpen={isAddProjectModalOpen}
                onClose={() => setIsAddProjectModalOpen(false)}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
            />
            <BrandManagerModal
                isOpen={isBrandManagerModalOpen}
                onClose={() => setIsBrandManagerModalOpen(false)}
                managers={brandManagers}
                projects={projects}
                onAdd={handleAddManager}
                onUpdate={handleUpdateManager}
                onDelete={handleDeleteManager}
            />
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                {...confirmationProps}
            />
        </div>
    );
}

export default App;
