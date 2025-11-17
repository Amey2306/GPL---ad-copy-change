import React, { useState, useEffect } from 'react';
import { AdCopy, AppState, Project, BrandManager, ActivityLog, ApprovalEvent } from './types';
import { PROJECTS } from './constants';
import * as geminiService from './services/geminiService';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadView from './views/UploadView';
import ReviewView from './views/ReviewView';
import VerifyView from './views/VerifyView';
import LogViewer from './components/LogViewer';
import LinkRepositoryViewer from './components/LinkRepositoryViewer';
import BrandManagerModal from './components/BrandManagerModal';
import AddProjectModal from './components/AddProjectModal';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
    // Global App State
    const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
    
    // Data stores
    const [projects, setProjects] = useState<Project[]>([]);
    const [brandManagers, setBrandManagers] = useState<BrandManager[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    // Current workflow state
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedBrandManager, setSelectedBrandManager] = useState<BrandManager | null>(null);
    const [creativeFiles, setCreativeFiles] = useState<File[]>([]);
    const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
    const [adCopyFile, setAdCopyFile] = useState<File | null>(null);
    const [workflowType, setWorkflowType] = useState<'update' | 'generate'>('update');
    
    const [analysis, setAnalysis] = useState('');
    const [originalGoogleAds, setOriginalGoogleAds] = useState<AdCopy[]>([]);
    const [originalMetaAds, setOriginalMetaAds] = useState<AdCopy[]>([]);
    const [updatedGoogleAds, setUpdatedGoogleAds] = useState<AdCopy[]>([]);
    const [updatedMetaAds, setUpdatedMetaAds] = useState<AdCopy[]>([]);
    const [isGenerated, setIsGenerated] = useState(false);
    const [approvalHistory, setApprovalHistory] = useState<ApprovalEvent[]>([]);
    
    // Modal states
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isLinksOpen, setIsLinksOpen] = useState(false);
    const [isManagersOpen, setIsManagersOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Project | BrandManager | null>(null);

    // Initialize data
    useEffect(() => {
        // Add unique IDs to projects
        setProjects(PROJECTS.map((p, i) => ({ ...p, id: `proj-${i + 1}` })));

        // Sample brand managers
        setBrandManagers([
            { id: 'bm-1', name: 'Aarav Sharma', email: 'aarav.sharma@godrej.com', phone: '9876543210', projectIds: ['proj-1', 'proj-2', 'proj-3', 'proj-7'] },
            { id: 'bm-2', name: 'Diya Mehta', email: 'diya.mehta@godrej.com', phone: '8765432109', projectIds: ['proj-4', 'proj-5', 'proj-6', 'proj-10'] },
            { id: 'bm-3', name: 'Rohan Patel', email: 'rohan.patel@godrej.com', phone: '7654321098', projectIds: ['proj-8', 'proj-9', 'proj-11', 'proj-12'] },
        ]);
    }, []);

    const addLog = (project: string, description: string, brandManager?: BrandManager) => {
        const newLog: ActivityLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date(),
            project,
            description,
            brandManager
        };
        setActivityLogs(prev => [...prev, newLog]);
    };

    const resetWorkflow = () => {
        setAppState(AppState.UPLOAD);
        setSelectedProject(null);
        setSelectedBrandManager(null);
        setCreativeFiles([]);
        setYoutubeUrls([]);
        setAdCopyFile(null);
        setWorkflowType('update');
        setAnalysis('');
        setOriginalGoogleAds([]);
        setOriginalMetaAds([]);
        setUpdatedGoogleAds([]);
        setUpdatedMetaAds([]);
        setIsGenerated(false);
        setApprovalHistory([]);
        addLog("System", "New workflow started.");
    };

    const handleAnalyze = async (googleAds: AdCopy[], metaAds: AdCopy[]) => {
        if (!selectedProject || creativeFiles.length === 0) return;
        setAppState(AppState.GENERATING);
        setOriginalGoogleAds(googleAds);
        setOriginalMetaAds(metaAds);
        setIsGenerated(false);
        addLog(selectedProject.name, "Started analysis of new creative against existing copy.", selectedBrandManager || undefined);

        try {
            const result = await geminiService.analyzeAdCopy(creativeFiles, googleAds, metaAds, selectedProject);
            setAnalysis(result.analysis);
            setUpdatedGoogleAds(result.updatedGoogleCopy);
            setUpdatedMetaAds(result.updatedMetaCopy);
            setAppState(AppState.REVIEW);
            addLog(selectedProject.name, "Gemini analysis and copy suggestions complete.");
        } catch (error) {
            console.error(error);
            alert("An error occurred during analysis. Please try again.");
            setAppState(AppState.UPLOAD);
        }
    };

    const handleGenerate = async () => {
        if (!selectedProject || (creativeFiles.length === 0 && youtubeUrls.length === 0)) return;
        setAppState(AppState.GENERATING);
        setOriginalGoogleAds([]);
        setOriginalMetaAds([]);
        setIsGenerated(true);
        addLog(selectedProject.name, "Started generating new ad copy from creative.", selectedBrandManager || undefined);
        
        try {
            const result = await geminiService.generateAdCopy(creativeFiles, youtubeUrls, selectedProject);
            setAnalysis(result.analysis);
            setUpdatedGoogleAds(result.updatedGoogleCopy);
            setUpdatedMetaAds(result.updatedMetaCopy);
            setAppState(AppState.REVIEW);
             addLog(selectedProject.name, "Gemini new ad copy generation complete.");
        } catch (error) {
            console.error(error);
            alert("An error occurred during generation. Please try again.");
            setAppState(AppState.UPLOAD);
        }
    };

    // Approval Flow
    const handleSendForApproval = () => {
        setAppState(AppState.APPROVAL_PENDING);
        setApprovalHistory([{ status: 'Sent', timestamp: new Date() }]);
        addLog(selectedProject!.name, `Copy sent for approval to ${selectedBrandManager!.name}.`);
    };
    
    const handleMarkAsApproved = () => {
        setAppState(AppState.APPROVED);
        setApprovalHistory(prev => [...prev, { status: 'Approved', timestamp: new Date() }]);
         addLog(selectedProject!.name, `Copy marked as approved by ${selectedBrandManager!.name}.`);
    };

    // Project CRUD
    const handleSaveProject = (projectData: Project | Omit<Project, 'id'>) => {
        if ('id' in projectData) { // Update
            setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
            addLog("System", `Project "${projectData.name}" updated.`);
        } else { // Add
            const newProject: Project = { ...projectData, id: `proj-${Date.now()}` };
            setProjects([...projects, newProject]);
            addLog("System", `New project "${newProject.name}" added.`);
        }
        setIsAddProjectOpen(false);
        setProjectToEdit(null);
    };

    const handleDeleteProject = (project: Project) => {
        setItemToDelete(project);
        setIsConfirmDeleteOpen(true);
    };

    // Brand Manager CRUD
    const handleAddManager = (manager: Omit<BrandManager, 'id'>) => {
        const newManager = { ...manager, id: `bm-${Date.now()}` };
        setBrandManagers([...brandManagers, newManager]);
        addLog("System", `Brand Manager "${newManager.name}" added.`);
    };

    const handleUpdateManager = (manager: BrandManager) => {
        setBrandManagers(brandManagers.map(m => m.id === manager.id ? manager : m));
        addLog("System", `Brand Manager "${manager.name}" updated.`);
    };

    const handleDeleteManager = (managerId: string) => {
        const manager = brandManagers.find(m => m.id === managerId);
        if (manager) {
            setItemToDelete(manager);
            setIsConfirmDeleteOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        if ('city' in itemToDelete) { // It's a Project
            setProjects(projects.filter(p => p.id !== itemToDelete.id));
             addLog("System", `Project "${itemToDelete.name}" deleted.`);
        } else { // It's a BrandManager
            setBrandManagers(brandManagers.filter(m => m.id !== itemToDelete.id));
            addLog("System", `Brand Manager "${itemToDelete.name}" deleted.`);
        }
        setIsConfirmDeleteOpen(false);
        setItemToDelete(null);
    };

    const renderCurrentView = () => {
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
                    onAddProject={() => { setProjectToEdit(null); setIsAddProjectOpen(true); }}
                    creativeFiles={creativeFiles}
                    setCreativeFiles={setCreativeFiles}
                    youtubeUrls={youtubeUrls}
                    setYoutubeUrls={setYoutubeUrls}
                    adCopyFile={adCopyFile}
                    setAdCopyFile={setAdCopyFile}
                    workflowType={workflowType}
                    setWorkflowType={setWorkflowType}
                />;
            case AppState.GENERATING:
                 return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-center">
                        <div className="holo-spinner"></div>
                        <h2 className="text-2xl font-bold text-gray-100 mt-6">Gemini is Working...</h2>
                        <p className="text-gray-400 mt-2">Analyzing creatives and crafting copy. This might take a moment.</p>
                    </div>
                );
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
                    onBack={() => setAppState(AppState.UPLOAD)}
                    isGenerated={isGenerated}
                    approvalHistory={approvalHistory}
                    project={selectedProject}
                    brandManager={selectedBrandManager}
                />;
            case AppState.VERIFY:
                return <VerifyView
                    project={selectedProject}
                    creativeFiles={creativeFiles}
                    analysis={analysis}
                    updatedGoogleAds={updatedGoogleAds}
                    updatedMetaAds={updatedMetaAds}
                    onBack={() => setAppState(AppState.REVIEW)}
                    addLog={(proj, desc) => addLog(proj, desc, selectedBrandManager || undefined)}
                 />;
            default:
                return null;
        }
    }

    return (
        <div className="h-screen w-screen bg-gray-900 text-gray-200 flex font-sans antialiased overflow-hidden">
             <style>{`
                :root {
                    --color-accent: 66 153 225; /* sky-500 */
                    --color-accent-glow: 29 78 216; /* blue-700 */
                    --color-success: 16 185 129; /* emerald-500 */
                    --color-warning: 245 158 11; /* amber-500 */
                    --color-danger: 239 68 68; /* red-500 */
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(var(--color-accent), 0.3); border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(var(--color-accent), 0.5); }
                /* Holo Spinner */
                .holo-spinner {
                    width: 60px; height: 60px;
                    border: 4px solid transparent;
                    border-radius: 50%;
                    border-top-color: #38bdf8; /* sky-400 */
                    border-left-color: #38bdf8;
                    animation: spin 1s linear infinite, color-cycle 4s linear infinite;
                    box-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes color-cycle {
                    0%, 100% { border-top-color: #38bdf8; border-left-color: #38bdf8; }
                    25% { border-top-color: #6366f1; border-left-color: #6366f1; } /* indigo-500 */
                    50% { border-top-color: #34d399; border-left-color: #34d399; } /* emerald-400 */
                    75% { border-top-color: #a78bfa; border-left-color: #a78bfa; } /* violet-400 */
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-fade-in-slide-up { animation: fadeInSlideUp 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInSlideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
             `}</style>
            <Sidebar appState={appState} />
            <main className="flex-1 flex flex-col">
                <Header 
                    onNewWorkflow={resetWorkflow} 
                    onViewLogs={() => setIsLogOpen(true)}
                    onViewLinks={() => setIsLinksOpen(true)}
                    onViewManagers={() => setIsManagersOpen(true)}
                />
                <div className="flex-1 overflow-hidden">
                     {renderCurrentView()}
                </div>
            </main>
            
            {/* Modals */}
            <LogViewer isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} logs={activityLogs} />
            <LinkRepositoryViewer 
                isOpen={isLinksOpen} 
                onClose={() => setIsLinksOpen(false)} 
                projects={projects}
                onAddProject={() => { setIsLinksOpen(false); setProjectToEdit(null); setIsAddProjectOpen(true); }}
                onEditProject={(p) => { setIsLinksOpen(false); setProjectToEdit(p); setIsAddProjectOpen(true); }}
                onDeleteProject={handleDeleteProject}
            />
            <BrandManagerModal
                isOpen={isManagersOpen}
                onClose={() => setIsManagersOpen(false)}
                managers={brandManagers}
                projects={projects}
                onAdd={handleAddManager}
                onUpdate={handleUpdateManager}
                onDelete={handleDeleteManager}
            />
            <AddProjectModal 
                isOpen={isAddProjectOpen}
                onClose={() => { setIsAddProjectOpen(false); setProjectToEdit(null); }}
                onSave={handleSaveProject}
                projectToEdit={projectToEdit}
            />
            <ConfirmationModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`Delete ${itemToDelete && 'city' in itemToDelete ? 'Project' : 'Manager'}`}
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default App;