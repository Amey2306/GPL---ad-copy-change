export interface AdCopy {
    field: string;
    text: string;
}

export interface ProjectLinks {
    [key: string]: string | undefined;
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
}

export interface Project {
    id: string;
    name: string;
    city: string;
    location: string;
    links: ProjectLinks;
}

export interface UploadSource {
    type: 'file' | 'url' | 'text';
    content: File | string;
}

export enum AppState {
    UPLOAD = 'UPLOAD',
    GENERATING = 'GENERATING',
    REVIEW = 'REVIEW',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    APPROVED = 'APPROVED',
    VERIFY = 'VERIFY',
}

export interface VerificationResult {
    url: string;
    name: string;
    verified: boolean;
    reason: string;
    error?: boolean;
}

export interface ActivityLog {
    id: string;
    timestamp: Date;
    project: string;
    description: string;
    brandManager?: BrandManager;
}

export interface ApprovalEvent {
    status: 'Sent' | 'Approved';
    timestamp: Date;
}

export interface BrandManager {
    id: string;
    name: string;
    email: string;
    phone: string;
    projectIds: string[];
}

export interface ProjectLink {
    name: string;
    url: string;
}
