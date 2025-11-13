import React from 'react';
import { ActivityLog } from '../types';

interface LogViewerProps {
    isOpen: boolean;
    onClose: () => void;
    logs: ActivityLog[];
}

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose, logs }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-100">Activity Log</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <ul className="space-y-4">
                        {[...logs].reverse().map(log => (
                            <li key={log.id} className="flex items-start space-x-3">
                                <div className="text-right flex-shrink-0 w-32">
                                    <p className="text-sm font-semibold text-sky-400 truncate">{log.project}</p>
                                    <p className="text-xs text-gray-500">{log.timestamp.toLocaleTimeString()}</p>
                                </div>
                                <div className="relative h-full flex justify-center">
                                    <div className="w-px bg-gray-700 h-full"></div>
                                    <div className="absolute top-1 w-3 h-3 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="text-sm text-gray-300">{log.description}</p>
                                    {log.brandManager && (
                                        <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-900/50 rounded-md border border-gray-700 w-fit">
                                            Approver: <span className="font-medium text-gray-400">{log.brandManager.name}</span> ({log.brandManager.email})
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LogViewer;