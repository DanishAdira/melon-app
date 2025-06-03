import { AnalysisResultData, ApiErrorResponse } from '../types/analysisTypes';

const API_ENDPOINT_URL = "/api/analyze-image";

export const analyzeImageAPI = async (formData: FormData): Promise<AnalysisResultData> => {
    try {
        const response = await fetch(API_ENDPOINT_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorData: ApiErrorResponse = { message: `HTTPエラー: ${response.status} ${response.statusText}` };
            try {
                errorData = await response.json();
            } catch (e) {
                // JSONパース失敗
            }
            throw new Error(errorData.message || `APIリクエストに失敗しました (ステータス: ${response.status})`);
        }

        const data: AnalysisResultData = await response.json();
        return data;

    } catch (error: any) {
        throw new Error(error.message || "画像分析APIへの接続に失敗しました．");
    }
};