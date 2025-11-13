import React, { useState, useCallback } from 'react';
import FileUpload from '../components/FileUpload';
import AdCopyUpload from '../components/AdCopyUpload';
import { UploadSource, AdCopy, Project } from '../types';
import ExcelJS from 'exceljs';

type UploadMode = 'upload' | 'generate';

interface UploadViewProps {
    onAnalyze: (googleAds: AdCopy[], metaAds: AdCopy[]) => void;
    onGenerate: (sources: UploadSource[]) => void;
    isAnalyzing: boolean;
    creativeFiles: File[];
    onCreativeFilesChange: (files: File[]) => void;
    adCopyFile: File | null;
    onAdCopyFileChange: (file: File | null) => void;
    error: string | null;
    onClearError: () => void;
    onError: (message: string) => void;
    projects: Project[];
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
}

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UploadView: React.FC<UploadViewProps> = ({ 
    onAnalyze, 
    onGenerate,
    isAnalyzing,
    creativeFiles,
    onCreativeFilesChange,
    adCopyFile,
    onAdCopyFileChange, 
    error, 
    onClearError, 
    onError,
    projects,
    selectedProject,
    setSelectedProject
}) => {
    const [uploadMode, setUploadMode] = useState<UploadMode>('upload');
    const [sources, setSources] = useState<UploadSource[]>([]);

    const parseAdCopyExcel = useCallback(async (file: File) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const googleSheet = workbook.getWorksheet('Google');
            const metaSheet = workbook.getWorksheet('Meta');

            if (!googleSheet || !metaSheet) {
                throw new Error("Invalid Excel format: The file must contain both 'Google' and 'Meta' worksheets.");
            }
            
            const parseSheet = (sheet: ExcelJS.Worksheet): AdCopy[] => {
                const ads: AdCopy[] = [];
                sheet.eachRow((row, rowNumber) => {
                    // Assuming headers are in the first row
                    if (rowNumber > 1) {
                         const field = row.getCell(1).value?.toString() || '';
                         const text = row.getCell(2).value?.toString() || '';
                         if(field && text) {
                            ads.push({ field, text });
                         }
                    }
                });
                return ads;
            };

            const googleAds = parseSheet(googleSheet);
            const metaAds = parseSheet(metaSheet);
            
            return { googleAds, metaAds };

        } catch (e: any) {
            console.error("Error parsing Excel file:", e);
            // Re-throw specific known errors or a generic one
            if (e.message.includes("worksheets")) {
                throw e;
            }
            throw new Error("Could not read the Excel file. It may be corrupt or in an unsupported format.");
        }
    }, []);


    const handleAdCopyUpload = useCallback((file: File) => {
        onClearError();
        onAdCopyFileChange(file);
    }, [onClearError, onAdCopyFileChange]);


    const handleAnalyzeClick = async () => {
        if (creativeFiles.length === 0 || !adCopyFile) return;
        onClearError();
        try {
            const { googleAds, metaAds } = await parseAdCopyExcel(adCopyFile);
            onAnalyze(googleAds, metaAds);
        } catch (e: any) {
             onError(e.message);
        }
    };

    const handleGenerateClick = async () => {
        if (creativeFiles.length === 0 || sources.length === 0) return;
        onClearError();
        // Filter out any empty sources before submitting
        const validSources = sources.filter(s => (s.type === 'file' ? s.content !== null : s.content.trim() !== ''));
        if (validSources.length === 0) {
            onError("Please provide content for at least one source material.");
            return;
        }
        onGenerate(validSources);
    };
    
    const isAnalyzeDisabled = !selectedProject || creativeFiles.length === 0 || !adCopyFile;
    const isGenerateDisabled = !selectedProject || creativeFiles.length === 0 || sources.length === 0 || sources.every(s => s.content === null || (typeof s.content === 'string' && s.content.trim() === ''));

    const renderUploadActions = () => (
         <div className="flex flex-col space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-slate-800">3. Upload Existing Ad Copy</h2>
            <p className="text-sm text-slate-600 -mt-4">
                Upload an Excel file with 'Google' and 'Meta' sheets containing the current ad copy.
            </p>
            <div className="h-48">
                <AdCopyUpload onFileUpload={handleAdCopyUpload} file={adCopyFile} onRemove={() => onAdCopyFileChange(null)} />
            </div>
             <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzeDisabled || isAnalyzing}
                className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
                {isAnalyzing ? <LoadingSpinner /> : null}
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Suggest Updates'}
            </button>
        </div>
    );
    
    const renderGenerateActions = () => {
        const addSource = (type: 'text' | 'file' | 'url') => {
            const newSource: UploadSource = type === 'file' ? { type, content: null } : { type, content: '' };
            setSources([...sources, newSource]);
        };

        const updateSource = (index: number, content: string | File) => {
            const newSources = [...sources];
            if (typeof content === 'string') {
                (newSources[index] as { content: string }).content = content;
            } else {
                (newSources[index] as { content: File | null }).content = content;
            }
            setSources(newSources);
        };
        
        const removeSource = (index: number) => {
            setSources(sources.filter((_, i) => i !== index));
        };

        return (
            <div className="flex flex-col space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-slate-800">3. Provide Source Materials</h2>
                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                    {sources.map((source, index) => (
                        <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                            <button onClick={() => removeSource(index)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            {source.type === 'text' && (
                                <textarea value={source.content as string} onChange={(e) => updateSource(index, e.target.value)} placeholder="Paste any relevant text here..." className="w-full h-24 p-2 border border-slate-300 rounded-md text-sm transition focus:ring-1 focus:ring-indigo-500" />
                            )}
                            {source.type === 'file' && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Document</label>
                                    <input type="file" onChange={(e) => updateSource(index, e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer" accept=".pdf,.doc,.docx,.txt" />
                                </div>
                            )}
                            {source.type === 'url' && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">YouTube URL</label>
                                    <input type="url" value={source.content as string} onChange={(e) => updateSource(index, e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-2 border border-slate-300 rounded-md text-sm transition focus:ring-1 focus:ring-indigo-500" />
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => addSource('text')} className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-full transition">+ Add Text</button>
                    <button onClick={() => addSource('file')} className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-full transition">+ Add File</button>
                    <button onClick={() => addSource('url')} className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-3 rounded-full transition">+ Add YouTube URL</button>
                </div>
                <button
                    onClick={handleGenerateClick}
                    disabled={isGenerateDisabled || isAnalyzing}
                    className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transition-all text-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {isAnalyzing ? <LoadingSpinner /> : null}
                    {isAnalyzing ? 'Generating...' : 'Generate New Ad Copy'}
                </button>
            </div>
        )
    };

    return (
        <div className="w-full p-4 sm:p-8 flex flex-col bg-slate-50">
            <div className="flex-shrink-0 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Upload Assets</h1>
                <p className="text-slate-500 mt-2">Start by selecting your project, uploading the creative, and providing the ad copy.</p>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg relative mb-6 animate-fade-in-slide-up" role="alert">
                    <div className="flex">
                        <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8h2v2H9v-2z"/></svg></div>
                        <div>
                            <p className="font-bold">An error occurred</p>
                            <p className="text-sm">{error}</p>
                        </div>
                         <button onClick={onClearError} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <svg className="fill-current h-6 w-6 text-red-400 hover:text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </button>
                    </div>
                </div>
            )}
            
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold text-slate-800">1. Select Project</h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Choose the project this creative belongs to. This will be used for verification later.
                    </p>
                    <select
                        value={selectedProject?.name || ''}
                        onChange={(e) => {
                            const project = projects.find(p => p.name === e.target.value) || null;
                            setSelectedProject(project);
                        }}
                        className={`w-full mt-4 p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition ${!selectedProject ? 'text-slate-400' : 'text-slate-800'}`}
                    >
                        <option value="" disabled>-- Select a Project --</option>
                        {projects.map(p => <option key={p.name} value={p.name} className="text-slate-800">{p.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     <div className="flex flex-col space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="text-xl font-semibold text-slate-800">2. Upload Ad Creative(s)</h2>
                        <p className="text-sm text-slate-600 -mt-2">
                            Upload one or more images for your ad campaign.
                        </p>
                        <div className="h-48">
                             <FileUpload 
                                files={creativeFiles} 
                                onFilesChange={(files) => { onCreativeFilesChange(files); onClearError(); }} 
                                multiple={uploadMode === 'generate'}
                            />
                        </div>
                    </div>
                    
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative flex items-center justify-center bg-slate-100 p-1 rounded-full mb-6">
                            <div className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white shadow-md rounded-full transition-transform duration-300 ease-in-out ${uploadMode === 'generate' ? 'translate-x-full' : ''}`}></div>
                            <button onClick={() => setUploadMode('upload')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold w-1/2 ${uploadMode === 'upload' ? 'text-indigo-600' : 'text-slate-600'}`}>Update Existing</button>
                            <button onClick={() => setUploadMode('generate')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold w-1/2 ${uploadMode === 'generate' ? 'text-indigo-600' : 'text-slate-600'}`}>Generate New</button>
                        </div>

                        {uploadMode === 'upload' ? renderUploadActions() : renderGenerateActions()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadView;