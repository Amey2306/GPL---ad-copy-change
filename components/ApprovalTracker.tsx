import React from 'react';
import { ApprovalEvent, AppState } from '../types';

interface ApprovalTrackerProps {
    history: ApprovalEvent[];
    status: AppState;
}

const formatTimestamp = (date: Date): string => {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({ history, status }) => {
    
    const sentEvent = history.find(e => e.status === 'Sent');
    const approvedEvent = history.find(e => e.status === 'Approved');

    const isPending = status === AppState.APPROVAL_PENDING;
    const isApproved = status === AppState.APPROVED;

    const timeline = [
        {
            name: 'Sent for Approval',
            completed: !!sentEvent,
            timestamp: sentEvent ? formatTimestamp(sentEvent.timestamp) : '',
            isCurrent: !sentEvent
        },
        {
            name: 'Pending Approval',
            completed: !!approvedEvent,
            timestamp: '',
            isCurrent: isPending
        },
        {
            name: 'Approval Received',
            completed: isApproved,
            timestamp: approvedEvent ? formatTimestamp(approvedEvent.timestamp) : '',
            isCurrent: false
        }
    ];

    const getStatusClasses = (completed: boolean, isCurrent: boolean) => {
        if (completed) {
            return {
                iconBg: 'bg-emerald-500',
                textColor: 'text-slate-800',
                icon: (
                    <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ),
            };
        }
        if (isCurrent) {
            return {
                iconBg: 'bg-indigo-500 ring-4 ring-indigo-200',
                textColor: 'text-indigo-600 font-semibold',
                icon: <div className="h-2 w-2 bg-white rounded-full"></div>,
            };
        }
        return {
            iconBg: 'bg-slate-300',
            textColor: 'text-slate-500',
            icon: <div className="h-2 w-2 bg-white rounded-full"></div>,
        };
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Approval Timeline</h3>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
                
                <ul className="space-y-4">
                    {timeline.map((item, index) => {
                        const classes = getStatusClasses(item.completed, item.isCurrent);
                        return (
                             <li key={index} className="flex items-center space-x-3">
                                <div className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full ${classes.iconBg}`}>
                                    {classes.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${classes.textColor}`}>{item.name}</p>
                                    {item.timestamp && <p className="text-xs text-slate-500">{item.timestamp}</p>}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ApprovalTracker;
