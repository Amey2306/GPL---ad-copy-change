
import React from 'react';

const stakeholders = [
    { name: 'Marketing Lead', status: 'approved', time: '1h ago' },
    { name: 'Legal Team', status: 'pending', time: '' },
    { name: 'Brand Manager', status: 'approved', time: '3h ago' },
];

const ApprovalTracker: React.FC = () => {
    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ),
                    text: 'text-emerald-600',
                    label: 'Approved'
                };
            case 'pending':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                    ),
                    text: 'text-amber-600',
                    label: 'Pending'
                };
            default:
                return { icon: null, text: 'text-slate-500', label: 'Unknown' };
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-semibold text-slate-800 mb-3">Approval Status</h3>
            <ul className="space-y-3">
                {stakeholders.map((stakeholder, index) => {
                    const statusInfo = getStatusClasses(stakeholder.status);
                    return (
                        <li key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                {statusInfo.icon}
                                <span className="text-sm text-slate-700 ml-2">{stakeholder.name}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={`text-xs font-semibold uppercase tracking-wider mr-2 ${statusInfo.text}`}>
                                    {statusInfo.label}
                                </span>
                                <span className="text-xs text-slate-400">{stakeholder.time}</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default ApprovalTracker;
