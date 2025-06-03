export interface AnalysisResultData {
    id                    : string;
    fileName              : string;
    meshDensity           : string;
    branchPoints          : number;
    detectionImageUrl?    : string;
    estimatedMeshImageUrl?: string;
    summary               : string;
}

export interface ApiErrorResponse {
    message   : string;
    errorCode?: string;
    details?  : any;
}