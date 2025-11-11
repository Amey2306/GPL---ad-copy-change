
export interface AdCopy {
    field: string;
    text: string;
}

export interface ProjectLink {
    name: string;
    url: string;
}

export interface Project {
    name: string;
    links: ProjectLink[];
}

export type UploadSource = 
    | { type: 'text'; content: string }
    | { type: 'file'; content: File }
    | { type: 'url'; content: string };

export interface VerificationResult {
    url: string;
    name: string;
    verified: boolean;
    reason: string;
    error?: boolean;
}

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
