import React from 'react';
import * as XLSX from 'xlsx';
import { Project, BrandManager, AdCopy } from '../types';
import FileUpload from '../components/FileUpload';
import AdCopyUpload from '../components/AdCopyUpload';

interface UploadViewProps {
    projects: Project[];
    brandManagers: BrandManager[];
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
    selectedBrandManager: BrandManager | null;
    setSelectedBrandManager: (manager: BrandManager | null) => void;
    onAnalyze: (googleAds: AdCopy[], metaAds: AdCopy[]) => void;
    onGenerate: () => void;
    onAddProject: () => void;
    creativeFiles: File[];
    setCreativeFiles: (files: File[]) => void;
    adCopyFile: File | null;
    setAdCopyFile: (file: File | null) => void;
    workflowType: 'update' | 'generate';
    setWorkflowType: (type: 'update' | 'generate') => void;
}

const parseAdCopyXLSX = (file: File): Promise<{ googleAds: AdCopy[], metaAds: AdCopy[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                
                const googleSheet = workbook.Sheets['Google'];
                const metaSheet = workbook.Sheets['Meta'];

                if (!googleSheet || !metaSheet) {
                    reject(new Error("XLSX file must contain both 'Google' and 'Meta' sheets."));
                    return;
                }
                
                // Helper to parse sheets with case-insensitive headers
                const parseSheet = (sheet: XLSX.WorkSheet): AdCopy[] => {
                     const jsonData = XLSX.utils.sheet_to_json<any>(sheet);
                     return jsonData
                        .map(row => {
                            // Normalize keys to lowercase to handle "Field" vs "field" etc.
                            const normalizedRow = Object.fromEntries(
                                Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
                            );
                            return {
                                field: normalizedRow.field,
                                text: normalizedRow.text,
                            };
                        })
                        .filter(item => item.field && item.text); // Filter out empty/malformed rows
                };

                const googleAds = parseSheet(googleSheet);
                const metaAds = parseSheet(metaSheet);

                resolve({ googleAds, metaAds });

            } catch (error) {
                console.error("Error parsing XLSX file:", error);
                reject(new Error("Failed to parse the ad copy file. Please check the format."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};


const UploadView: React.FC<UploadViewProps> = ({
    projects, brandManagers, selectedProject, setSelectedProject,
    selectedBrandManager, setSelectedBrandManager,
    onAnalyze, onGenerate, onAddProject,
    creativeFiles, setCreativeFiles, adCopyFile, setAdCopyFile,
    workflowType, setWorkflowType
}) => {
    
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectId = e.target.value;
        const project = projects.find(p => p.id === projectId) || null;
        setSelectedProject(project);
        setSelectedBrandManager(null); // Reset manager when project changes
    };

    const handleProceed = async () => {
        if (workflowType === 'update') {
            if (adCopyFile) {
                try {
                    const { googleAds, metaAds } = await parseAdCopyXLSX(adCopyFile);
                    onAnalyze(googleAds, metaAds);
                } catch (error) {
                    alert(error instanceof Error ? error.message : "An unknown parsing error occurred.");
                }
            }
        } else {
            onGenerate();
        }
    };
    
    const assignedManagers = React.useMemo(() => {
        if (!selectedProject) return [];
        return brandManagers.filter(bm => bm.projectIds.includes(selectedProject.id));
    }, [selectedProject, brandManagers]);

    const isProceedDisabled = !selectedProject || !selectedBrandManager || creativeFiles.length === 0 || (workflowType === 'update' && !adCopyFile);

    return (
        <div className="w-full p-4 sm:p-8 bg-gray-900 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Upload Assets</h1>
                <p className="text-gray-400 mt-2">Start a new workflow by selecting a project and uploading your creatives and source materials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">1. Select Project</h3>
                        <div className="flex items-center space-x-2">
                             <select
                                value={selectedProject?.id || ''}
                                onChange={handleProjectChange}
                                className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            >
                                <option value="" disabled>Choose a project...</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button onClick={onAddProject} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600" title="Add New Project">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className={`bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 transition-opacity duration-500 ${selectedProject ? 'opacity-100' : 'opacity-50'}`}>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">2. Assign Approver</h3>
                         <select
                            value={selectedBrandManager?.id || ''}
                            onChange={(e) => {
                                const managerId = e.target.value;
                                const manager = brandManagers.find(m => m.id === managerId) || null;
                                setSelectedBrandManager(manager);
                            }}
                            disabled={!selectedProject}
                            className="block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm disabled:cursor-not-allowed"
                        >
                            <option value="" disabled>{selectedProject ? (assignedManagers.length > 0 ? "Choose an approver..." : "No managers assigned") : "Select a project first"}</option>
                             {assignedManagers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">3. Choose Workflow</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setWorkflowType('update')} className={`p-4 rounded-lg border-2 text-left transition-all ${workflowType === 'update' ? 'border-sky-500 bg-sky-900/20 shadow-lg shadow-sky-500/10' : 'border-gray-600 bg-gray-900/30 hover:bg-gray-700/50'}`}>
                                <h4 className="font-semibold text-white">Update Existing Copy</h4>
                                <p className="text-xs text-gray-400 mt-1">Analyze a new creative against existing ad copy.</p>
                            </button>
                            <button onClick={() => setWorkflowType('generate')} className={`p-4 rounded-lg border-2 text-left transition-all ${workflowType === 'generate' ? 'border-sky-500 bg-sky-900/20 shadow-lg shadow-sky-500/10' : 'border-gray-600 bg-gray-900/30 hover:bg-gray-700/50'}`}>
                                <h4 className="font-semibold text-white">Generate New Copy</h4>
                                <p className="text-xs text-gray-400 mt-1">Create new ad copy from creatives and source material.</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3 space-y-6">
                    <div className={`bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 h-64 transition-opacity duration-500 ${workflowType === 'update' || workflowType === 'generate' ? 'opacity-100' : 'opacity-50'}`}>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">4. Upload Creative(s)</h3>
                        <FileUpload 
                            files={creativeFiles}
                            onFilesChange={setCreativeFiles}
                            multiple
                        />
                    </div>
                     <div className={`bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 h-64 transition-opacity duration-500 ${workflowType === 'update' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <h3 className="text-lg font-semibold text-gray-100 mb-4">5. Upload Existing Ad Copy</h3>
                        <AdCopyUpload 
                            file={adCopyFile}
                            onFileUpload={setAdCopyFile}
                            onRemove={() => setAdCopyFile(null)}
                        />
                    </div>
                </div>
            </div>
            
             <div className="mt-8 flex justify-end">
                <button
                    onClick={handleProceed}
                    disabled={isProceedDisabled}
                    className="py-3 px-8 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-400 transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    Analyze & Proceed
                </button>
            </div>
        </div>
    );
};

export default UploadView;
