import React, { useState, useCallback } from 'react';
import FileUpload from '../components/FileUpload';
import AdCopyUpload from '../components/AdCopyUpload';
import { UploadSource, AdCopy, Project } from '../types';
import ExcelJS from 'exceljs';

type UploadMode = 'upload' | 'generate';

interface UploadViewProps {
    onAnalyze: (imageFile: File, googleAds: AdCopy[], metaAds: AdCopy[]) => void;
    onGenerate: (imageFile: File, source: UploadSource) => void;
    error: string | null;
    onClearError: () => void;
    onError: (message: string) => void;
    projects: Project[];
    selectedProject: Project | null;
    setSelectedProject: (project: Project | null) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ 
    onAnalyze, 
    onGenerate, 
    error, 
    onClearError, 
    onError,
    projects,
    selectedProject,
    setSelectedProject
}) => {
    const [creativeFile, setCreativeFile] = useState<File | null>(null);
    const [adCopyFile, setAdCopyFile] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<UploadMode>('upload');

    const [sourceType, setSourceType] = useState<'text' | 'file' | 'url'>('text');
    const [sourceText, setSourceText] = useState('');
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [sourceUrl, setSourceUrl] = useState('');

    const parseAdCopyExcel = useCallback(async (file: File) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const buffer = await file.arrayBuffer();
            await workbook.xlsx.load(buffer);

            const googleSheet = workbook.getWorksheet('Google');
            const metaSheet = workbook.getWorksheet('Meta');

            if (!googleSheet || !metaSheet) {
                throw new Error("Excel file must contain 'Google' and 'Meta' sheets.");
            }
            
            const parseSheet = (sheet: ExcelJS.Worksheet): AdCopy[] => {
                const ads: AdCopy[] = [];
                sheet.eachRow((row, rowNumber) => {
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
            throw new Error(e.message || "Failed to parse Excel file.");
        }
    }, []);


    const handleAdCopyUpload = useCallback((file: File) => {
        onClearError();
        setAdCopyFile(file);
    }, [onClearError]);


    const handleAnalyzeClick = async () => {
        if (!creativeFile || !adCopyFile) return;
        onClearError();
        try {
            const { googleAds, metaAds } = await parseAdCopyExcel(adCopyFile);
            onAnalyze(creativeFile, googleAds, metaAds);
        } catch (e: any) {
             onError(e.message || "Failed to parse the Excel file. Please check its format and content.");
        }
    };

    const handleGenerateClick = () => {
        if (!creativeFile) return;
        onClearError();
        let source: UploadSource;
        if (sourceType === 'text' && sourceText) {
            source = { type: 'text', content: sourceText };
        } else if (sourceType === 'file' && sourceFile) {
            source = { type: 'file', content: sourceFile };
        } else if (sourceType === 'url' && sourceUrl) {
            source = { type: 'url', content: sourceUrl };
        } else {
            return;
        }
        onGenerate(creativeFile, source);
    };
    
    const isAnalyzeDisabled = !selectedProject || !creativeFile || !adCopyFile;
    const isGenerateDisabled = !selectedProject || !creativeFile || (sourceType === 'text' && !sourceText) || (sourceType === 'file' && !sourceFile) || (sourceType === 'url' && !sourceUrl);


    const renderUploadMode = () => (
         <div className="flex flex-col space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">3. Upload Existing Ad Copy</h2>
            <p className="text-sm text-slate-600 -mt-4">
                Upload an Excel file with 'Google' and 'Meta' sheets containing the current ad copy.
            </p>
            <div className="h-48">
                <AdCopyUpload onFileUpload={handleAdCopyUpload} file={adCopyFile} onRemove={() => setAdCopyFile(null)} />
            </div>
             <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzeDisabled}
                className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all text-lg"
            >
                Analyze & Suggest Updates
            </button>
        </div>
    );
    
    const renderGenerateMode = () => (
         <div className="flex flex-col space-y-6">
            <h2 className="text-xl font-semibold text-slate-800">3. Provide Source Material</h2>
            <p className="text-sm text-slate-600 -mt-4">
                Provide source material for Gemini to generate brand new ad copy from scratch.
            </p>
            <div>
                 <div className="flex border-b border-slate-200">
                    <button onClick={() => setSourceType('text')} className={`px-4 py-2 text-sm font-medium ${sourceType === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Text</button>
                    <button onClick={() => setSourceType('file')} className={`px-4 py-2 text-sm font-medium ${sourceType === 'file' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>File</button>
                    <button onClick={() => setSourceType('url')} className={`px-4 py-2 text-sm font-medium ${sourceType === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>YouTube URL</button>
                </div>
                <div className="pt-4">
                    {sourceType === 'text' && <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste any relevant text here (e.g., brochure copy, project description)." className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />}
                    {sourceType === 'file' && <input type="file" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />}
                    {sourceType === 'url' && <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />}
                </div>
            </div>
             <button
                onClick={handleGenerateClick}
                disabled={isGenerateDisabled}
                className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all text-lg"
            >
                Generate New Ad Copy
            </button>
        </div>
    );


    return (
        <div className="w-full h-full p-8 flex flex-col bg-slate-50 overflow-y-auto custom-scrollbar">
            <div className="flex-shrink-0 mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Upload Assets</h1>
                <p className="text-slate-500 mt-2">Start by selecting your project, uploading the creative, and providing the ad copy.</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <button onClick={onClearError} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                </div>
            )}
            
            <div className="space-y-8">
                <div className="flex flex-col space-y-4 bg-white p-6 rounded-xl border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">1. Select Project</h2>
                    <p className="text-sm text-slate-600 -mt-2">
                        Choose the project this creative belongs to. This will be used for verification later.
                    </p>
                    <select
                        value={selectedProject?.name || ''}
                        onChange={(e) => {
                            const project = projects.find(p => p.name === e.target.value) || null;
                            setSelectedProject(project);
                        }}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="" disabled>-- Select a Project --</option>
                        {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-8 items-start">
                     <div className="flex flex-col space-y-4 bg-white p-6 rounded-xl border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800">2. Upload Ad Creative</h2>
                        <p className="text-sm text-slate-600 -mt-2">
                            Upload the primary image or video thumbnail for your ad campaign.
                        </p>
                        <div className="h-48">
                             <FileUpload onFileUpload={(file) => { setCreativeFile(file); onClearError(); }} file={creativeFile} onRemove={() => setCreativeFile(null)} />
                        </div>
                    </div>
                    
                     <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-center space-x-2 bg-slate-200 p-1 rounded-full mb-6">
                            <button onClick={() => setUploadMode('upload')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${uploadMode === 'upload' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Update Existing</button>
                            <button onClick={() => setUploadMode('generate')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${uploadMode === 'generate' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}>Generate New</button>
                        </div>

                        {uploadMode === 'upload' ? renderUploadMode() : renderGenerateMode()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadView;