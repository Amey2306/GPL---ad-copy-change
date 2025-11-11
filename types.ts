// types.ts

export interface AdCopy {
    field: string;
    text: string;
}

export interface Project {
    name: string;
    city: string;
    location: string;
    links: {
        overviewPage?: string;
        landingPage?: string;
        teaserLandingPage?: string;
        digitalCollaterals?: string;
        alternateCollaterals?: string;
        eoiPortal?: string;
        internationalPage?: string;
        ppLandingPage?: string;
        ppLandingPageNew?: string;
        rcpLandingPage?: string;
        eoiWindow?: string;
    };
}

export interface ProjectLink {
    name: string;
    url: string;
}

export type UploadSource = {
    type: 'text' | 'url';
    content: string;
} | {
    type: 'file';
    content: File;
};

export enum LogType {
    ANALYSIS = 'ANALYSIS',
    GENERATE = 'GENERATE',
    APPROVAL = 'APPROVAL',
    VERIFICATION = 'VERIFICATION',
    DOWNLOAD = 'DOWNLOAD',
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: LogType;
    project: string;
    description: string;
}

export enum AppState {
    UPLOAD = 'UPLOAD',
    REVIEW = 'REVIEW',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    APPROVED = 'APPROVED',
    VERIFY = 'VERIFY',
}

export interface ApprovalEvent {
    status: 'Sent' | 'Approved';
    timestamp: Date;
}

export interface VerificationResult {
    url: string;
    name: string;
    verified: boolean;
    reason: string;
    error?: boolean;
}
