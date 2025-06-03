import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }                             from 'react-router-dom';
import ImageUploader                               from '../components/ImageUploader';
import Button                                      from '../components/common/Button';
import LoadingSpinner                              from '../components/common/LoadingSpinner';
import styles                                      from './ImageUploadPage.module.css';

const ImageUploadPage = () => {
    const navigate                                = useNavigate();
    const [selectedFile, setSelectedFile]         = useState<File | null>(null);
    const [isLoading, setIsLoading]               = useState<boolean>(false);
    const [error, setError]                       = useState<string | null>(null);
    const [uploaderResetKey, setUploaderResetKey] = useState<number>(0);

    useEffect(() => {
        const hasVisited = sessionStorage.getItem("hasVisited");
        if (!hasVisited) {
            sessionStorage.setItem("hasVisited", "true");
            navigate("/", { replace: true });
        }
    }, [navigate]);

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

        const formData = new FormData();
        formData.append("imageFile", selectedFile);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const shouldSucceed = Math.random() > 0.15;

            if (!shouldSucceed) {
                throw new Error("画像の分析処理に失敗しました (サーバーエラーシミュレーション).");
            }

            const mockApiResult = {
                id                   : `analysis_${Date.now()}`,
                fileName             : selectedFile.name,
                meshDensity          : `${(Math.random() * 15 + 75).toFixed(1)}%`,
                branchPoints         : Math.floor(Math.random() * 100 + 150),
                detectionImageUrl    : selectedFile ? URL.createObjectURL(selectedFile) : undefined,
                estimatedMeshImageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
                summary              : `「${selectedFile.name}」のメロン網目構造を分析しました (シミュレーション結果).`,
            };

            navigate("/analysis_results", { state: { analysisResult: mockApiResult } });

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
                    <LoadingSpinner message="分析処理を実行中です．しばらくお待ちください..." />
                </div>
            )}
        </div>
    );
};

export default ImageUploadPage;