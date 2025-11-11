
import React from 'react';

interface SidebarProps {
    currentStep: number;
}

const steps = ['Upload Assets', 'Review & Refine', 'Verify & Export'];

const Sidebar: React.FC<SidebarProps> = ({ currentStep }) => {
    return (
        <aside className="w-64 bg-white p-6 border-r border-slate-200 hidden md:flex flex-col">
            <div className="flex items-center space-x-3 mb-10">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-800">AdGen</h1>
            </div>

            <nav>
                <ul className="space-y-2">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;

                        return (
                            <li key={step}>
                                <div className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold mr-3 ${
                                        isActive ? 'bg-indigo-600 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {isCompleted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            stepNumber
                                        )}
                                    </div>
                                    <span className={`font-medium ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{step}</span>
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
