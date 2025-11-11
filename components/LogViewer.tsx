import React, { useState, useMemo } from 'react';
import { LogEntry, LogType, Project } from '../types';

interface LogViewerProps {
    isOpen: boolean;
    onClose: () => void;
    logs: LogEntry[];
    projects: Project[];
}

// FIX: Replaced JSX.Element with React.ReactElement to fix "Cannot find namespace 'JSX'" error.
const LogTypeDetails: { [key in LogType]: { icon: React.ReactElement, color: string, label: string } } = {
    [LogType.ANALYSIS]: {
        label: 'Analysis',
        color: 'bg-blue-100 text-blue-600',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    },
    [LogType.GENERATE]: {
        label: 'Generate',
        color: 'bg-purple-100 text-purple-600',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
    [LogType.APPROVAL]: {
        label: 'Approval',
        color: 'bg-teal-100 text-teal-600',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    [LogType.VERIFICATION]: {
        label: 'Verification',
        color: 'bg-amber-100 text-amber-600',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>,
    },
    [LogType.DOWNLOAD]: {
        label: 'Download',
        color: 'bg-emerald-100 text-emerald-600',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    },
};

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose, logs, projects }) => {
    const [filterType, setFilterType] = useState<string>('all');
    const [filterProject, setFilterProject] = useState<string>('all');

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const typeMatch = filterType === 'all' || log.type === filterType;
            const projectMatch = filterProject === 'all' || log.project === filterProject;
            return typeMatch && projectMatch;
        });
    }, [logs, filterType, filterProject]);

    if (!isOpen) return null;
    
    const hasFilters = filterType !== 'all' || filterProject !== 'all';

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div 
                className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Activity Log</h2>
                        <p className="text-sm text-slate-500 mt-1">History of all workflow actions.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm transition focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="all">All Event Types</option>
                        {Object.entries(LogTypeDetails).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                    <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm transition focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                    <button 
                        onClick={() => { setFilterType('all'); setFilterProject('all'); }} 
                        disabled={!hasFilters}
                        className="w-full p-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {filteredLogs.length > 0 ? (
                        <ul className="space-y-4">
                            {filteredLogs.map(log => {
                                const details = LogTypeDetails[log.type];
                                return (
                                <li key={log.id} className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${details.color}`}>
                                        {details.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">{log.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            <span className="font-semibold">{log.project}</span> &middot; {log.timestamp.toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                                )
                            })}
                        </ul>
                    ) : (
                         <div className="text-center py-16">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Logs Found</h3>
                            <p className="mt-1 text-sm text-gray-500">{hasFilters ? 'Try adjusting your filters.' : 'No activities have been recorded yet.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogViewer;