import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate }                             from 'react-router-dom';
import ImageUploader                               from '../components/ImageUploader';
import Button                                      from '../components/common/Button';
import LoadingSpinner                              from '../components/common/LoadingSpinner';
import styles                                      from './ImageUploadPage.module.css';
import { AnalysisResultData }                         from '../types/analysisTypes';
interface AnalysisResponse {
    density: number;
    branch_points: number;
    input_image: string;
    plotted_image: string;
    mask_image: string;
    //circularity: number;
    mesh_uniformity: number;
    quality_score: number | null;
    //contour_image: string;
    branch_vis_image: string;
}

const ImageUploadPage = () => {
    const navigate                                = useNavigate();
    const [selectedFile, setSelectedFile]         = useState<File | null>(null);
    const [crossingDate, setCrossingDate]         = useState<string>('');
    const [isLoading, setIsLoading]               = useState<boolean>(false);
    const [error, setError]                       = useState<string | null>(null);
    const [uploaderResetKey, setUploaderResetKey] = useState<number>(0);

    const handleFileSelected = useCallback((file: File | null) => {
        setSelectedFile(file);
        setError(null);
    }, []);

// ★追加: 日付変更ハンドラ
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCrossingDate(e.target.value);
        setError(null); // 日付が変更されたらエラーをクリア
    };

// ★追加: 交配後日数を計算する関数
    const calculateDaysAfterCrossing = (dateStr: string): number | null => {
        if (!dateStr) return null;

        try {
            // JSTでの「今日」の0時0分を取得
            const now = new Date();
            const todayJST = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayTime = todayJST.getTime();

            // JSTでの「交配日」の0時0分を取得 (YYYY-MM-DD形式を正しくパース)
            const parts = dateStr.split('-');
            const crossingDateJST = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            const crossingTimeJST = crossingDateJST.getTime();

            if (crossingTimeJST > todayTime) {
                setError("交配日は本日以前の日付を選択してください。");
                return null; // 未来日は無効
            }

            const diffTime = todayTime - crossingTimeJST;
            // ミリ秒を日数に変換し、切り上げ (交配日当日は0日目)
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // 交配日当日は「0日目」として返す
            return diffDays;
        } catch (e) {
            console.error("Date calculation error:", e);
            return null;
        }
    };

    const handleAnalysis = async () => {
        if (!selectedFile) {
            setError("分析する画像が選択されていません．");
            return;
        }

        let daysAfterCrossing: number | null = null;
        if (crossingDate) {
            daysAfterCrossing = calculateDaysAfterCrossing(crossingDate);
            if (daysAfterCrossing === null && error) {
                // calculateDaysAfterCrossing内で未来日エラーがセットされた場合
                setIsLoading(false); // ローディング開始前なので解除
                return;
            }
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
                daysAfterCrossing: daysAfterCrossing,
                meshDensity: apiResult.density,
                branchPoints: apiResult.branch_points,
                // circularity: apiResult.circularity,
                meshUniformity: apiResult.mesh_uniformity,
                qualityScore: apiResult.quality_score,
                inputImageUrl: 'data:image/png;base64,' + apiResult.input_image,
                detectionImageUrl: 'data:image/png;base64,' + apiResult.plotted_image,
                estimatedMeshImageUrl: 'data:image/png;base64,' + apiResult.mask_image,
                // contourImageUrl: 'data:image/png;base64,' + apiResult.contour_image,
                branchVisImageUrl: 'data:image/png;base64,' + apiResult.branch_vis_image,
                summary:  `「${selectedFile.name}」のメロン網目構造を分析しました。`,
            }


            navigate("/analysis_results", { state: { analysisResult } });

            setSelectedFile(null);
            setCrossingDate('');
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

            <div className={styles.dateInputContainer}>
                <label htmlFor="crossingDate" className={styles.dateLabel}>
                    交配日:
                </label>
                <input
                    type="date"
                    id="crossingDate"
                    value={crossingDate}
                    onChange={handleDateChange}
                    disabled={isLoading}
                    className={styles.dateInput}
                />
                <p className={styles.dateCaption}>
                    交配日を入力すると，分析実行日時点での「交配経過日目」が表示されます．
                </p>
            </div>

            <ImageUploader
                onFileSelect={handleFileSelected}
                disabled={isLoading}
                resetKey={uploaderResetKey}
                className={styles.uploaderSection}
            />

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

            {error && (
                <div className={styles.errorMessage}>
                    <p>エラー: {error}</p>
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