import React, { useState, useRef } from 'react';
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
    youtubeUrls: string[];
    setYoutubeUrls: (urls: string[]) => void;
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
                
                const parseSheet = (sheet: XLSX.WorkSheet): AdCopy[] => {
                    const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, range: 1 });
                    return data
                        .map(row => ({
                            field: String(row[0] || ''),
                            text: String(row[1] || ''),
                        }))
                        .filter(item => item.field && item.text);
                };

                const googleAds = parseSheet(googleSheet);
                const metaAds = parseSheet(metaSheet);

                if (googleAds.length === 0 && metaAds.length === 0) {
                     reject(new Error("Could not find any valid ad copy data in the 'Google' or 'Meta' sheets. Please ensure data is in the first two columns."));
                     return;
                }

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

const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const UploadView: React.FC<UploadViewProps> = ({
    projects, brandManagers, selectedProject, setSelectedProject,
    selectedBrandManager, setSelectedBrandManager,
    onAnalyze, onGenerate, onAddProject,
    creativeFiles, setCreativeFiles, youtubeUrls, setYoutubeUrls, adCopyFile, setAdCopyFile,
    workflowType, setWorkflowType
}) => {
    
    const [youtubeInput, setYoutubeInput] = useState('');
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const projectId = e.target.value;
        const project = projects.find(p => p.id === projectId) || null;
        setSelectedProject(project);
        setSelectedBrandManager(null);
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
    
    const handleAddYoutubeUrl = () => {
        if (youtubeInput && getYoutubeVideoId(youtubeInput) && !youtubeUrls.includes(youtubeInput)) {
            setYoutubeUrls([...youtubeUrls, youtubeInput]);
        }
        setYoutubeInput('');
        setShowYoutubeInput(false);
    };

    const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = event.target.files;
        if (newFiles) {
            setCreativeFiles([...creativeFiles, ...Array.from(newFiles)]);
        }
        if(event.target) {
            event.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setCreativeFiles(creativeFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveUrl = (indexToRemove: number) => {
        setYoutubeUrls(youtubeUrls.filter((_, index) => index !== indexToRemove));
    };
    
    const assignedManagers = React.useMemo(() => {
        if (!selectedProject) return [];
        return brandManagers.filter(bm => bm.projectIds.includes(selectedProject.id));
    }, [selectedProject, brandManagers]);

    const isProceedDisabled = !selectedProject || !selectedBrandManager || (creativeFiles.length === 0 && youtubeUrls.length === 0) || (workflowType === 'update' && !adCopyFile);

    const renderSourceUploader = () => {
        const hasSources = creativeFiles.length > 0 || youtubeUrls.length > 0;
        return (
            <div className="w-full h-full flex flex-col bg-gray-900/50 rounded-xl">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {hasSources ? (
                        <div className="grid grid-cols-2 gap-2">
                           {creativeFiles.map((file, index) => {
                                const isImage = file.type.startsWith('image/');
                                return (
                                     <div key={`${file.name}-${index}`} className="relative aspect-square bg-black/30 p-1 rounded-lg flex flex-col items-center justify-center text-center">
                                        {isImage ? (
                                            <img src={URL.createObjectURL(file)} alt="Preview" className="max-h-full max-w-full object-contain rounded-md"/>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                <span className="text-xs mt-2 font-semibold">PDF</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-md"><p className="truncate">{file.name}</p></div>
                                        <button onClick={() => handleRemoveFile(index)} className="absolute top-1 right-1 p-1 bg-gray-900/70 backdrop-blur-sm rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors transform hover:scale-110" aria-label="Remove"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                );
                           })}
                           {youtubeUrls.map((url, index) => {
                                const videoId = getYoutubeVideoId(url);
                                return (
                                    <div key={url} className="relative aspect-square bg-black/30 p-1 rounded-lg flex flex-col items-center justify-center text-center">
                                        {videoId && <img src={`https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="YouTube thumbnail" className="max-h-full max-w-full object-contain rounded-md"/>}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 rounded-b-md"><p className="truncate">{url}</p></div>
                                        <button onClick={() => handleRemoveUrl(index)} className="absolute top-1 right-1 p-1 bg-gray-900/70 backdrop-blur-sm rounded-full text-gray-400 hover:bg-red-500/50 hover:text-white transition-colors transform hover:scale-110" aria-label="Remove"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                    </div>
                                );
                           })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-500">
                           <p>Add source material to get started.</p>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 grid grid-cols-3 gap-2 p-2 border-t border-gray-700/50">
                    <button onClick={() => imageInputRef.current?.click()} className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg><span>Add Images</span></button>
                    <button onClick={() => pdfInputRef.current?.click()} className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg><span>Add PDF</span></button>
                    <button onClick={() => setShowYoutubeInput(true)} className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg><span>YouTube URL</span></button>
                </div>
                <input type="file" ref={imageInputRef} onChange={handleFileAdd} accept="image/jpeg,image/png,image/webp" multiple className="hidden" />
                <input type="file" ref={pdfInputRef} onChange={handleFileAdd} accept="application/pdf" multiple className="hidden" />
                {showYoutubeInput && (
                     <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowYoutubeInput(false)}>
                        <div className="bg-gray-800 rounded-lg p-4 w-full max-w-lg shadow-lg border border-gray-700 animate-fade-in-slide-up" onClick={e => e.stopPropagation()}>
                           <h4 className="font-semibold text-white mb-2">Add YouTube URL</h4>
                           <div className="flex space-x-2">
                                <input type="url" value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="flex-1 bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                                <button onClick={handleAddYoutubeUrl} className="py-2 px-4 bg-sky-600 text-white rounded-md font-semibold hover:bg-sky-700">Add</button>
                           </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col p-4 sm:p-8 bg-gray-900">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Upload Assets</h1>
                <p className="text-gray-400 mt-2">Start a new workflow by selecting a project and uploading your creatives and source materials.</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
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
                            <h3 className="text-lg font-semibold text-gray-100 mb-4">{workflowType === 'generate' ? '4. Upload Source Material' : '4. Upload Creative(s)'}</h3>
                            {workflowType === 'generate' ? (
                                renderSourceUploader()
                            ) : (
                                <FileUpload 
                                    files={creativeFiles}
                                    onFilesChange={setCreativeFiles}
                                    multiple
                                />
                            )}
                        </div>
                        <div className={`bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 h-64 transition-opacity duration-500 ${workflowType === 'update' ? 'opacity-100' : 'opacity-50 pointer-events-none'} ${workflowType === 'generate' ? 'hidden' : ''}`}>
                            <h3 className="text-lg font-semibold text-gray-100 mb-4">5. Upload Existing Ad Copy</h3>
                            <AdCopyUpload 
                                file={adCopyFile}
                                onFileUpload={setAdCopyFile}
                                onRemove={() => setAdCopyFile(null)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
             <div className="flex-shrink-0 mt-8 flex justify-end">
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