import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }                             from 'react-router-dom';
import ImageUploader                               from '../components/ImageUploader';
import Button                                      from '../components/common/Button';
import LoadingSpinner                              from '../components/common/LoadingSpinner';
import styles                                      from './ImageUploadPage.module.css';
import { read } from 'fs';

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

        //const formData = new FormData();
        //formData.append("imageFile", selectedFile);

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

            const response = await fetch("https://jhuxct22zb.execute-api.ap-northeast-1.amazonaws.com/v1/inference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "YAu9dpKNXg6rJjnTYghR13F5MmMirXZ99hHp3rF6"
                },
                body: JSON.stringify({
                    body: base64String,
                    isBase64Encoded: true,
                })
            });

            if (!response.ok) {
                throw new Error(`APIリクエストに失敗しました: ${response.statusText}`);
            }

            const maskData: number[][] = await response.json();

            const canvas = document.createElement("canvas");
            const width = maskData[0].length;
            const height = maskData.length;
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvasのコンテキストが取得できませんでした．");
            }

            const imageData = ctx.createImageData(width, height);
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const value = maskData[y][x];
                    const index = (y * width + x) * 4;
                    imageData.data[index + 0] = value;
                    imageData.data[index + 1] = value;
                    imageData.data[index + 2] = value;
                    imageData.data[index + 3] = 255;
                }
            }
            ctx.putImageData(imageData, 0, 0);
            const maskImageUrl = canvas.toDataURL();

            const analysisResult = {
                id                  : `analysis_${Date.now()}`,
                fileName             : selectedFile.name,
                meshDensity          : "-",
                branchPoints         : "-",
                detectionImageUrl    : URL.createObjectURL(selectedFile),
                estimatedMeshImageUrl: maskImageUrl,
                summary              : `「${selectedFile.name}」のメロン網目構造を分析しました (シミュレーション結果).`,
            }

            // const mockApiResult = {
            //     id                   : `analysis_${Date.now()}`,
            //     fileName             : selectedFile.name,
            //     meshDensity          : `${(Math.random() * 15 + 75).toFixed(1)}%`,
            //     branchPoints         : Math.floor(Math.random() * 100 + 150),
            //     detectionImageUrl    : selectedFile ? URL.createObjectURL(selectedFile) : undefined,
            //     estimatedMeshImageUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
            //     summary              : `「${selectedFile.name}」のメロン網目構造を分析しました (シミュレーション結果).`,
            // };

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