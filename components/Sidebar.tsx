import React from 'react';
import { AppState } from '../types';

interface SidebarProps {
    appState: AppState;
}

const steps = ['Upload Assets', 'Review & Refine', 'Verify & Export'];

const Sidebar: React.FC<SidebarProps> = ({ appState }) => {
    
    const getCurrentStep = () => {
        switch (appState) {
            case AppState.UPLOAD:
                return 0;
            case AppState.REVIEW:
            case AppState.APPROVAL_PENDING:
            case AppState.APPROVED:
                return 1;
            case AppState.VERIFY:
                return 2;
            default:
                return 0;
        }
    }

    const currentStepIndex = getCurrentStep();

    return (
        <aside className="w-64 bg-gray-900 p-6 border-r border-gray-800 hidden md:flex flex-col">
            <div className="flex items-center space-x-3 mb-10">
                <div className="bg-gradient-to-br from-sky-500 to-indigo-500 p-2 rounded-lg" style={{ filter: 'drop-shadow(0 0 5px var(--color-accent-glow))' }}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-100">AdGen</h1>
            </div>

            <nav className="relative">
                 <div 
                    className="absolute left-0 w-1 h-12 bg-sky-400 rounded-r-full transition-all duration-500 ease-in-out"
                    style={{ 
                        transform: `translateY(${currentStepIndex * 56}px)`,
                        filter: 'drop-shadow(0 0 8px var(--color-accent))' 
                    }}
                ></div>
                <ul className="space-y-2">
                    {steps.map((step, index) => {
                        const isActive = index === currentStepIndex;
                        const isCompleted = index < currentStepIndex;

                        return (
                            <li key={step}>
                                <div className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-gray-800/50' : 'text-gray-400 hover:bg-gray-800/30'}`}>
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                                        isActive ? 'bg-sky-500 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                                    }`}>
                                        {isCompleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>{step}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;