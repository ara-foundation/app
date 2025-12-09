export const PATCH_KEYWORD = 'patcher';

export const PATCH_EVENT_TYPES = {
    PATCH_CREATED: 'patch-created',
    PATCH_UPDATE: 'patch-update',
    PATCH_REMOVED: 'patch-removed',
} as const;

export interface PatchCreatedEventDetail {
    patch: import('./roadmap').Patch;
    versionId: string;
}

export interface PatchUpdateEventDetail {
    fromVersionId: string;
    toVersionId: string;
    patch: import('./roadmap').Patch;
}

export interface PatchRemovedEventDetail {
    patch: import('./roadmap').Patch;
    versionId: string;
}

