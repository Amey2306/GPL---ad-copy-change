import React from 'react';

interface HeaderProps {
    onNewWorkflow: () => void;
    onViewLogs: () => void;
    onViewLinks: () => void;
    onViewManagers: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewWorkflow, onViewLogs, onViewLinks, onViewManagers }) => {
    return (
        <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 sm:px-8 py-3 flex items-center justify-end space-x-2 sm:space-x-4">
            <button
                onClick={onViewManagers}
                className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                title="View Brand Managers"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="hidden sm:inline">Managers</span>
            </button>
            <button
                onClick={onViewLinks}
                className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                title="View Link Repository"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                <span className="hidden sm:inline">Links</span>
            </button>
            <button
                onClick={onViewLogs}
                className="flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                title="View Activity Log"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Logs</span>
            </button>
            
             <div className="h-6 w-px bg-gray-700"></div>

            <button
                onClick={onNewWorkflow}
                className="flex items-center space-x-2 py-2 px-4 bg-gray-800 rounded-md text-sm font-semibold text-sky-400 border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-colors"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>New Workflow</span>
            </button>
        </header>
    );
};

export default Header;