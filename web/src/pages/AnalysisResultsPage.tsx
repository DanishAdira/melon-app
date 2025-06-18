// src/pages/AnalysisResultsPage.tsx
import React, { useEffect }  from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles                from './AnalysisResultsPage.module.css';

const AnalysisResultsPage = () => {
    const location = useLocation();
    const result   = location.state?.analysisResult;

    useEffect(() => {
        const urlsToRevoke: string[] = [];
        if (result?.detectionImageUrl && result.detectionImageUrl.startsWith('blob:')) {
        urlsToRevoke.push(result.detectionImageUrl);
        }
        if (result?.estimatedMeshImageUrl && result.estimatedMeshImageUrl.startsWith('blob:')) {
        urlsToRevoke.push(result.estimatedMeshImageUrl);
        }

        return () => {
        urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
        };
    }, [result]);

    if (!result) {
        return (
        <div className={styles.pageContainer}>
            <h1>分析結果</h1>
            <p>分析結果データが見つかりませんでした．画像アップロードページからやり直してください．</p>
            <div className={styles.actionsContainer}>
            <Link to="/image_upload" className="button-primary">別の画像を分析する</Link>
            </div>
        </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
        <h1>メロン分析結果</h1>

        <div className={styles.resultHeader}>
            <p><strong>ファイル名:</strong> {result.fileName || 'N/A'}</p>
            <p><strong>分析ID:</strong> {result.id || 'N/A'}</p>
            {result.summary && <p><strong>サマリー:</strong> {result.summary}</p>}
        </div>

        <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
            <h3>網目密度</h3>
            <p className={styles.resultCardValue}>{result.meshDensity || '---'}</p>
            </div>
            <div className={styles.resultCard}>
            <h3>分岐点数</h3>
            <p className={styles.resultCardValue}>{result.branchPoints || '---'}</p>
            </div>
        </div>

        <div className={styles.imageSection}>
            <h3>入力画像</h3>
            {result.detectionImageUrl ? (
            <img
                src={result.detectionImageUrl}
                alt="入力画像"
                className={styles.resultImage}
            />
            ) : (
            <p>入力画像はありません．</p>
            )}
            <p className={styles.imageCaption}>(選択された画像)</p>
        </div>

        <div className={styles.imageSection}>
            <h3>網目推定（画像）</h3>
            {result.estimatedMeshImageUrl ? (
            <img
                src={result.estimatedMeshImageUrl}
                alt="網目推定"
                className={styles.resultImage}
            />
            ) : (
            <p>網目推定画像はありません．</p>
            )}
            <p className={styles.imageCaption}>(シミュレーション画像)</p>
        </div>

        <div className={styles.actionsContainer}>
            <Link to="/image_upload" className="button-primary">別の画像を分析する</Link>
        </div>
        </div>
    );
};

export default AnalysisResultsPage;