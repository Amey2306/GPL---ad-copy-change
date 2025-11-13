import React from 'react';
import { Project } from '../types';

interface LinkRepositoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    onAddProject: () => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (project: Project) => void;
}

const formatLinkCategory = (key: string): string => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const LinkRepositoryViewer: React.FC<LinkRepositoryViewerProps> = ({ isOpen, onClose, projects, onAddProject, onEditProject, onDeleteProject }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-100">Project Link Repository</h2>
                     <div className="flex items-center space-x-2">
                        <button onClick={onAddProject} className="py-2 px-3 text-sm font-medium text-sky-300 bg-sky-900/50 border border-sky-700 rounded-md hover:bg-sky-900">Add Project</button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        {projects.map(project => (
                             <div key={project.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-white">{project.name}</h3>
                                        <p className="text-sm text-gray-400">{project.location}, {project.city}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => onEditProject(project)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                        <button onClick={() => onDeleteProject(project)} className="p-2 text-gray-400 hover:text-white hover:bg-red-900/50 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {Object.entries(project.links).map(([key, url]) => (
                                            url && (
                                                <div key={key} className="flex">
                                                    <dt className="w-1/2 text-gray-500">{formatLinkCategory(key)}</dt>
                                                    <dd className="w-1/2 text-gray-300 truncate">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 hover:underline">{url}</a>
                                                    </dd>
                                                </div>
                                            )
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkRepositoryViewer;
