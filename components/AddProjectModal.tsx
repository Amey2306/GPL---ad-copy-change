import React, { useState, useEffect } from 'react';
import { Project } from '../types';

interface ProjectEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (project: Project | Omit<Project, 'id'>) => void;
    projectToEdit: Project | null;
}

const linkFields = [
    'overviewPage', 'landingPage', 'teaserLandingPage', 'digitalCollaterals',
    'alternateCollaterals', 'eoiPortal', 'internationalPage', 'ppLandingPage',
    'ppLandingPageNew', 'rcpLandingPage', 'eoiWindow'
];

const getInitialState = (project: Project | null): Omit<Project, 'id'> => {
    if (project) {
         const links = { ...Object.fromEntries(linkFields.map(field => [field, ''])), ...project.links };
         return { ...project, links };
    }
    return {
        name: '', city: '', location: '',
        links: Object.fromEntries(linkFields.map(field => [field, ''])),
    };
};

const AddProjectModal: React.FC<ProjectEditorModalProps> = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const [project, setProject] = useState(getInitialState(projectToEdit));

    useEffect(() => {
        setProject(getInitialState(projectToEdit));
    }, [projectToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name' || name === 'city' || name === 'location') {
            setProject(prev => ({ ...prev, [name]: value }));
        } else {
            setProject(prev => ({
                ...prev,
                links: { ...prev.links, [name]: value },
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalLinks = Object.fromEntries(Object.entries(project.links).filter(([, value]) => value));
        
        if (projectToEdit) {
            onSave({ ...project, id: projectToEdit.id, links: finalLinks });
        } else {
            onSave({ ...project, links: finalLinks });
        }
        onClose();
    };
    
    const formatLabel = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    if (!isOpen) return null;
    
    const modalTitle = projectToEdit ? "Edit Project" : "Add New Project";
    const buttonText = projectToEdit ? "Save Changes" : "Add Project";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[700px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-100">{modalTitle}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Project Name</label>
                            <input type="text" name="name" id="name" required value={project.name} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-300">City</label>
                            <input type="text" name="city" id="city" required value={project.city} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
                            <input type="text" name="location" id="location" required value={project.location} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-200 pt-4 border-t border-gray-700">Project Links</h3>
                        {linkFields.map((key) => (
                             <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-gray-300">{formatLabel(key)}</label>
                                <input type="url" name={key} id={key} value={project.links[key as keyof typeof project.links]} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                            </div>
                        ))}
                    </div>
                </form>
                <footer className="flex-shrink-0 p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500">
                        Cancel
                    </button>
                    <button type="submit" onClick={handleSubmit} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500">
                        {buttonText}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddProjectModal;