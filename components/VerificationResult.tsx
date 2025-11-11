
import React from 'react';
import { VerificationResult } from '../types';

interface VerificationResultDisplayProps {
    results: VerificationResult[];
}

const VerificationResultDisplay: React.FC<VerificationResultDisplayProps> = ({ results }) => {
    return (
        <div className="space-y-4">
            {results.length > 0 ? (
                results.map((result, index) => (
                    <div key={index} className={`bg-white p-4 rounded-xl shadow-sm border flex items-start space-x-4 ${result.verified ? 'border-emerald-200' : 'border-red-200'}`}>
                        <div className="flex-shrink-0 pt-1">
                            {result.verified ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-800 break-all">
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                                    {result.url}
                                </a>
                            </p>
                            <p className={`mt-1 text-sm ${result.verified ? 'text-emerald-800' : 'text-red-800'}`}>
                                {result.reason}
                            </p>
                            {result.error && <p className="mt-1 text-xs text-red-600">Error: {result.error}</p>}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Results Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Click "Verify Live Changes" to check the project websites.</p>
                </div>
            )}
        </div>
    );
};

export default VerificationResultDisplay;
