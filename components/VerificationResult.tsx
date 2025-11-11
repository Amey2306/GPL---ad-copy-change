
import React from 'react';
import { VerificationResult } from '../types';

interface VerificationResultDisplayProps {
    results: VerificationResult[];
}

const VerificationResultDisplay: React.FC<VerificationResultDisplayProps> = ({ results }) => {
    return (
        <div className="space-y-4">
            {results.length > 0 ? (
                results.map((result, index) => {
                    const isError = result.error;
                    const isVerified = result.verified;
                    
                    let borderColor = 'border-slate-200';
                    let statusBgColor = 'bg-slate-100';
                    let statusTextColor = 'text-slate-600';
                    let reasonTextColor = 'text-slate-700';
                    
                    if (isError) {
                        borderColor = 'border-amber-300';
                        statusBgColor = 'bg-amber-100';
                        statusTextColor = 'text-amber-600';
                        reasonTextColor = 'text-amber-800';
                    } else if (isVerified) {
                        borderColor = 'border-emerald-300';
                        statusBgColor = 'bg-emerald-100';
                        statusTextColor = 'text-emerald-600';
                        reasonTextColor = 'text-emerald-800';
                    } else {
                        borderColor = 'border-red-300';
                        statusBgColor = 'bg-red-100';
                        statusTextColor = 'text-red-600';
                        reasonTextColor = 'text-red-800';
                    }

                    return (
                        <div 
                            key={index} 
                            className={`bg-white p-4 rounded-xl shadow-sm border flex items-start space-x-4 ${borderColor} animate-fade-in-slide-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex-shrink-0 pt-1">
                                <div className={`w-6 h-6 rounded-full ${statusBgColor} flex items-center justify-center`}>
                                {isError ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${statusTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                ) : isVerified ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${statusTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${statusTextColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-slate-800 break-all">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                        {result.name}
                                    </a>
                                </p>
                                <p className={`mt-1 text-sm font-medium ${reasonTextColor}`}>
                                    {result.reason}
                                </p>
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Results Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Select the URLs to check and click "Verify Live Changes".</p>
                </div>
            )}
        </div>
    );
};

export default VerificationResultDisplay;
