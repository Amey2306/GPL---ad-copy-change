import React, { useState, useMemo } from 'react';
import { Project } from '../types';

interface LinkRepositoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
}

const CATEGORY_MAP: { [key: string]: string } = {
  overviewPage: 'Overview Page Link',
  landingPage: 'Landing Page Link',
  teaserLandingPage: 'Teaser Landing Page',
  digitalCollaterals: 'Digital Collaterals Link',
  alternateCollaterals: 'Alternate Collaterals Link',
  eoiPortal: 'EOI Portal Page',
  internationalPage: 'International Page',
  ppLandingPage: 'PP Landing Page',
  ppLandingPageNew: 'PP Landing Page New',
  rcpLandingPage: 'RCP Landing Page',
  eoiWindow: 'EOI Window',
};

const formatLinkCategory = (key: string): string => {
    return CATEGORY_MAP[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

const LinkRepositoryViewer: React.FC<LinkRepositoryViewerProps> = ({ isOpen, onClose, projects }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = useMemo(() => {
        if (!searchTerm) {
            return projects;
        }
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div
                className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[800px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Project Link Repository</h2>
                        <p className="text-sm text-slate-500 mt-1">A central database of all project website links.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by project name, city, or location..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border border-slate-300 rounded-md text-sm transition focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    {filteredProjects.length > 0 ? (
                        <div className="space-y-4">
                            {filteredProjects.map(project => (
                                <div key={project.name} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <h3 className="text-md font-semibold text-slate-800">{project.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{project.location}, {project.city}</p>
                                    <ul className="mt-3 space-y-2">
                                        {Object.entries(project.links).map(([category, url]) => (
                                            <li key={category} className="text-sm p-2 rounded-md bg-slate-50 border border-slate-200">
                                                 <p className="font-medium text-slate-600 text-xs uppercase tracking-wider">{formatLinkCategory(category)}</p>
                                                 <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all text-sm">
                                                    {url}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7c0-1.1.9-2 2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No Projects Found</h3>
                            <p className="mt-1 text-sm text-gray-500">Your search for "{searchTerm}" did not match any projects.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LinkRepositoryViewer;