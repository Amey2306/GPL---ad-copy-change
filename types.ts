
export enum AppState {
    INITIAL = 'INITIAL',
    ANALYZING = 'ANALYZING',
    ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
    APPROVAL_SENT = 'APPROVAL_SENT',
    VERIFYING_CHANGES = 'VERIFYING_CHANGES',
    VERIFICATION_COMPLETE = 'VERIFICATION_COMPLETE',
}

export type UploadMode = 'upload' | 'generate';

export interface UploadSource {
    type: 'text' | 'file' | 'url';
    content: string | File;
}

export interface AdCopy {
    field: string;
    text: string;
}

export interface VerificationResult {
    url: string;
    verified: boolean;
    reason: string;
    error?: string;
}

export interface ProjectLink {
    name: string;
    url:string;
}

export interface Project {
    name: string;
    links: ProjectLink[];
}
