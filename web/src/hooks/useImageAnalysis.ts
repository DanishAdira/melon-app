import { useState, useCallback } from 'react';
import { analyzeImageAPI }       from '../services/imageAnalysisAPI';
import { AnalysisResultData }    from '../types/analysisTypes';

interface UseImageAnalysisReturn {
    triggerAnalysis: (file: File) => Promise<AnalysisResultData | null>;
    analysisData   : AnalysisResultData | null;
    isLoading      : boolean;
    error          : string | null;
}

const useImageAnalysis = (): UseImageAnalysisReturn => {
    const [analysisData, setAnalysisData] = useState<AnalysisResultData | null>(null);
    const [isLoading, setIsLoading]       = useState<boolean>(false);
    const [error, setError]               = useState<string | null>(null);

    const triggerAnalysis = useCallback(async (file: File): Promise<AnalysisResultData | null> => {
        if (!file) {
        setError("分析するファイルが指定されていません．");
        return null;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisData(null);

        const formData = new FormData();
        formData.append("imageFile", file);

        try {
            const result = await analyzeImageAPI(formData);
            setAnalysisData(result);
            return result;
        } catch (err: any) {
            const errorMessage = err.message || "分析中に予期せぬエラーが発生しました．";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { triggerAnalysis, analysisData, isLoading, error };
};

export default useImageAnalysis;