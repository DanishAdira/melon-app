import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }                             from 'react-router-dom';
import ImageUploader                               from '../components/ImageUploader';
import Button                                      from '../components/common/Button';
import LoadingSpinner                              from '../components/common/LoadingSpinner';
import styles                                      from './ImageUploadPage.module.css';

interface AnalysisResponse {
    density: number;
    branch_points: number;
    plotted_image: string;
    mask_image: string;
}

const ImageUploadPage = () => {
    const navigate                                = useNavigate();
    const [selectedFile, setSelectedFile]         = useState<File | null>(null);
    const [isLoading, setIsLoading]               = useState<boolean>(false);
    const [error, setError]                       = useState<string | null>(null);
    const [uploaderResetKey, setUploaderResetKey] = useState<number>(0);

    const handleFileSelected = useCallback((file: File | null) => {
        setSelectedFile(file);
        setError(null);
    }, []);

    const handleAnalysis = async () => {
        if (!selectedFile) {
            setError("分析する画像が選択されていません．");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);

            const base64String: string = await new Promise((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
            });

            const lambdaUrl = process.env.REACT_APP_LAMBDA_FUNCTION_URL;
            if (!lambdaUrl) {
                throw new Error("Lambda function URL is not defined in environment variables.");
            }

            const response = await fetch(lambdaUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image_data: base64String,
                    filename: selectedFile.name
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "サーバーから有効なエラー応答がありませんでした。" }));
                const errorMessage = errorData.error || (errorData.body ? JSON.parse(errorData.body).error : response.statusText);
                throw new Error(`APIリクエストに失敗しました: ${errorMessage}`);
            }

            const apiResult: AnalysisResponse = await response.json();

            const now       = new Date();
            const year      = now.getFullYear();
            const month     = String(now.getMonth() + 1).padStart(2, '0');
            const day       = String(now.getDate()).padStart(2, '0');
            const hours     = String(now.getHours()).padStart(2, '0');
            const minutes   = String(now.getMinutes()).padStart(2, '0');
            const seconds   = String(now.getSeconds()).padStart(2, '0');

            const analysisId = `analysis_${year}${month}${day}_${hours}${minutes}${seconds}`;

            const analysisResult = {
                id: analysisId,
                fileName: selectedFile.name,
                meshDensity: apiResult.density,
                branchPoints: apiResult.branch_points,
                detectionImageUrl: 'data:image/png;base64,' + apiResult.plotted_image,
                estimatedMeshImageUrl: 'data:image/png;base64,' + apiResult.mask_image,
                summary:  `「${selectedFile.name}」のメロン網目構造を分析しました。`,
            }


            navigate("/analysis_results", { state: { analysisResult } });

            setSelectedFile(null);
            setUploaderResetKey(prevKey => prevKey + 1);

        } catch (err: any) {
            setError(err.message || "分析中に予期せぬエラーが発生しました．");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1>画像アップロード</h1>
            <p className={styles.introText}>分析したい画像をアップロードしてください</p>

            <ImageUploader
                onFileSelect={handleFileSelected}
                disabled={isLoading}
                resetKey={uploaderResetKey}
                className={styles.uploaderSection}
            />

            {error && (
                <div className={styles.errorMessage}>
                    <p>エラー: {error}</p>
                </div>
            )}

            {selectedFile && !isLoading && !error && (
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={handleAnalysis}
                        disabled={isLoading}
                        className="button-primary"
                    >
                        {isLoading ? "分析中..." : "この画像を分析する"}
                    </Button>
                </div>
            )}

            {isLoading && (
                <div className={styles.loadingContainer}>
                    <LoadingSpinner message={"分析処理を実行中です．しばらくお待ちください... \n 初回実行時は時間がかかるおそれがあります．"}/>
                </div>
            )}
        </div>
    );
};

export default ImageUploadPage;