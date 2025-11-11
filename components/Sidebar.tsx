
import React from 'react';
import { AppState } from '../types';

interface SidebarProps {
    appState: AppState;
    onReset: () => void;
}

const STEPS = [
    { name: 'Upload Assets', states: [AppState.INITIAL] },
    { name: 'Review & Update', states: [AppState.ANALYZING, AppState.ANALYSIS_COMPLETE] },
    { name: 'Verify Live', states: [AppState.APPROVAL_SENT, AppState.VERIFYING_CHANGES, AppState.VERIFICATION_COMPLETE] },
];

const Sidebar: React.FC<SidebarProps> = ({ appState, onReset }) => {
    
    const isCurrentStep = (stepStates: AppState[]) => stepStates.includes(appState);

    const isCompletedStep = (stepStates: AppState[]) => {
        const lastStateOfStep = stepStates[stepStates.length - 1];
        const appStateOrder = Object.values(AppState);
        return appStateOrder.indexOf(appState) > appStateOrder.indexOf(lastStateOfStep);
    }

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4">
            <div className="flex items-center mb-10 h-8 px-2">
                <svg className="h-7 w-7 text-blue-900" width="51" height="42" viewBox="0 0 51 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.63636 42H0L21 0H25.6364L46.6364 42H42L36.9545 30.4348H14.0455L9 42H4.63636ZM16.0909 25.1304H34.9091L25.5 6.56522L16.0909 25.1304Z" fill="currentColor"/>
                </svg>
                <span className="ml-2.5 text-xl font-bold text-blue-900">
                    Godrej<span className="font-light text-slate-500"> Properties</span>
                </span>
            </div>
            
            <nav className="flex-1">
                <ul className="space-y-6">
                    {STEPS.map((step, index) => {
                        const isCurrent = isCurrentStep(step.states);
                        const isCompleted = isCompletedStep(step.states);
                        return (
                             <li key={step.name}>
                                <div className={`flex items-center p-2 rounded-lg ${isCurrent ? 'bg-blue-50' : ''}`}>
                                    <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                        isCompleted ? 'bg-blue-600 text-white' 
                                        : isCurrent ? 'border-2 border-blue-600 text-blue-600'
                                        : 'border-2 border-slate-300 text-slate-500'
                                    }`}>
                                        {isCompleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : `0${index + 1}`}
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${
                                        isCurrent ? 'text-blue-700'
                                        : isCompleted ? 'text-slate-800'
                                        : 'text-slate-500'
                                    }`}>{step.name}</span>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="mt-auto">
                <button 
                    onClick={onReset}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.13-5.12M20 15a9 9 0 01-14.13 5.12" />
                    </svg>
                    Start New Workflow
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
