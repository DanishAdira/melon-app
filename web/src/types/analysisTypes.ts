export interface AnalysisResultData {
    id                    : string;
    fileName              : string;
    meshDensity           : string;
    branchPoints          : number;
    circularity?          : number;
    meshUniformity        : number;
    qualityScore?         : number | null;
    inputImageUrl?        : string;
    detectionImageUrl?    : string;
    estimatedMeshImageUrl?: string;
    contourImageUrl?      : string;
    branchVisImageUrl?    : string;
    summary               : string;
}

export interface ApiErrorResponse {
    message   : string;
    errorCode?: string;
    details?  : any;
}