import React, { useState, useEffect } from 'react';
import { BrandManager, Project } from '../types';

interface BrandManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    managers: BrandManager[];
    projects: Project[];
    onAdd: (manager: Omit<BrandManager, 'id'>) => void;
    onUpdate: (manager: BrandManager) => void;
    onDelete: (managerId: string) => void;
}

const ManagerForm: React.FC<{
    manager: BrandManager | Omit<BrandManager, 'id'> | null,
    projects: Project[],
    onSave: (manager: BrandManager | Omit<BrandManager, 'id'>) => void,
    onCancel: () => void
}> = ({ manager, projects, onSave, onCancel }) => {
    
    const getInitialState = () => {
        if (manager) return { ...manager };
        return { name: '', email: '', phone: '', projectIds: [] };
    };

    const [formData, setFormData] = useState(getInitialState);

    useEffect(() => {
        setFormData(getInitialState());
    }, [manager]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectToggle = (projectId: string) => {
        setFormData(prev => {
            const projectIds = prev.projectIds?.includes(projectId)
                ? prev.projectIds.filter(id => id !== projectId)
                : [...(prev.projectIds || []), projectId];
            return { ...prev, projectIds };
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert("Name and Email are required.");
            return;
        }
        onSave(formData as BrandManager | Omit<BrandManager, 'id'>);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-900/50 border-t border-b border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">{manager && 'id' in manager ? 'Edit Manager' : 'Add New Manager'}</h3>
            <div className="space-y-4">
                <input type="text" name="name" placeholder="Name (Required)" value={formData.name} onChange={handleChange} required className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-sky-500 focus:border-sky-500"/>
                <input type="email" name="email" placeholder="Email (Required)" value={formData.email} onChange={handleChange} required className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-sky-500 focus:border-sky-500"/>
                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-sky-500 focus:border-sky-500"/>
                
                <div>
                    <h4 className="text-md font-medium text-gray-300 mb-2">Assigned Projects</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-800 rounded-md border border-gray-600 custom-scrollbar">
                        {projects.map(p => (
                             <label key={p.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                                <input type="checkbox" checked={formData.projectIds?.includes(p.id)} onChange={() => handleProjectToggle(p.id)} className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-sky-500 focus:ring-sky-500"/>
                                <span className="text-sm text-gray-200">{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
             <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">{manager && 'id' in manager ? 'Save Changes' : 'Add Manager'}</button>
            </div>
        </form>
    );
};


const BrandManagerModal: React.FC<BrandManagerModalProps> = ({ isOpen, onClose, managers, projects, onAdd, onUpdate, onDelete }) => {
    const [editingManager, setEditingManager] = useState<BrandManager | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (manager: BrandManager | Omit<BrandManager, 'id'>) => {
        if ('id' in manager) {
            onUpdate(manager);
        } else {
            onAdd(manager);
        }
        setEditingManager(null);
        setIsAdding(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden animate-fade-in-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-6 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-100">Brand Managers</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => { setIsAdding(true); setEditingManager(null); }} className="py-2 px-3 text-sm font-medium text-sky-300 bg-sky-900/50 border border-sky-700 rounded-md hover:bg-sky-900">Add Manager</button>
                        <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                </header>
                
                {(isAdding || editingManager) && (
                    <ManagerForm
                        manager={editingManager || null}
                        projects={projects}
                        onSave={handleSave}
                        onCancel={() => { setIsAdding(false); setEditingManager(null); }}
                    />
                )}
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <ul className="space-y-3">
                        {managers.map(manager => (
                            <li key={manager.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-white">{manager.name}</h3>
                                        <a href={`mailto:${manager.email}`} className="text-sm text-sky-400 hover:underline">{manager.email}</a>
                                        {manager.phone && <p className="text-sm text-gray-400">{manager.phone}</p>}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button onClick={() => { setEditingManager(manager); setIsAdding(false); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                        <button onClick={() => onDelete(manager.id)} className="p-2 text-gray-400 hover:text-white hover:bg-red-900/50 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </div>
                                {manager.projectIds.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Assigned Projects</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {manager.projectIds.map(id => {
                                                const project = projects.find(p => p.id === id);
                                                return project ? <span key={id} className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-md">{project.name}</span> : null;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BrandManagerModal;
