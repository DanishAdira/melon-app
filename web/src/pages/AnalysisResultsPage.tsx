// src/pages/AnalysisResultsPage.tsx
import React, { useEffect }  from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles                from './AnalysisResultsPage.module.css';

const AnalysisResultsPage = () => {
    const location = useLocation();
    const result   = location.state?.analysisResult;

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
    const meshDensityDisplay = result.meshDensity !== undefined ? result.meshDensity + '%' : '---';
    const branchPointsDisplay = result.branchPoints !== undefined ? result.branchPoints : '---';
    // const circularityDisplay = result.circularity !== undefined ? result.circularity : '---';
    const meshUniformityDisplay = result.meshUniformity !== undefined ? result.meshUniformity : '---';
    const qualityScoreDisplay = result.qualityScore !== undefined && result.qualityScore !== null
                                ? result.qualityScore.toFixed(2) // 小数点第2位まで表示 + 単位
                                : '---';
    const daysAfterCrossingDisplay = result.daysAfterCrossing !== null && result.daysAfterCrossing !== undefined
                                ? `${result.daysAfterCrossing} 日目`
                                : 'N/A'; // 日付が入力されなかった場合

    return (
        <div className={styles.pageContainer}>
            <h1>メロン分析結果</h1>

            <div className={styles.resultHeader}>
                <p><strong>ファイル名:</strong> {result.fileName || 'N/A'}</p>
                <p><strong>分析ID:</strong> {result.id || 'N/A'}</p>
                <p><strong>交配経過日目:</strong> {daysAfterCrossingDisplay}</p>
                {result.summary && <p><strong>サマリー:</strong> {result.summary}</p>}
            </div>

            <div className={`${styles.resultCard} ${styles.qualityScoreCard}`}>
                <h3>品質スコア</h3>
                <p className={`${styles.resultCardValue} ${styles.qualityScoreValue}`}>
                    {qualityScoreDisplay}
                </p>
            </div>

            <div className={styles.resultGrid}>
                <div className={styles.resultCard}>
                <h3>網目密度</h3>
                <p className={styles.resultCardValue}>{meshDensityDisplay}</p>
            </div>
            <div className={styles.resultCard}>
                <h3>分岐点数</h3>
                <p className={styles.resultCardValue}>{branchPointsDisplay}</p>
            </div>
            {/* <div className={styles.resultCard}> }
                <h3>真円度</h3>
                <p className={styles.resultCardValue}>{circularityDisplay}</p>
            {</div> */}
            <div className={styles.resultCard}>
                <h3>網目均一性</h3>
                <p className={styles.resultCardValue}>{meshUniformityDisplay}</p>
            </div>
            {/* <div className={styles.resultCard}>
                <h3>品質スコア</h3>
                <p className={styles.resultCardValue}>{qualityScoreDisplay}</p>
            </div> */}
        </div>

        <div className={styles.imageSection}>
            <h3>分析したメロン</h3>
            {result.inputImageUrl ? (
            <img
                src={result.inputImageUrl}
                alt="分析したメロン"
                className={styles.resultImage}
            />
            ) : (
            <p>画像はありません．</p>
            )}
            <p className={styles.imageCaption}>(分析対象のメロン(入力画像))</p>
        </div>

        {/* <div className={styles.imageSection}>
            <h3>網目推定（セグメント化された画像）</h3>
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

        <div className={styles.imageSection}>
            <h3>形状解析画像</h3>
            {result.contourImageUrl ? (
            <img
                src={result.contourImageUrl}
                alt="輪郭検出画像"
                className={styles.resultImage}
            />
            ) : (
            <p>輪郭検出画像はありません．</p>
            )}
            <p className={styles.imageCaption}>(最大外接円と最小内接円に基づく真円度)</p>
        </div>

        <div className={styles.imageSection}>
            <h3>分岐点プロット画像</h3>
            {result.branchVisImageUrl ? (
            <img
                src={result.branchVisImageUrl}
                alt="分岐点プロット画像"
                className={styles.resultImage}
            />
            ) : (
            <p>分岐点プロット画像はありません．</p>
            )}
            <p className={styles.imageCaption}>(分岐点の位置のプロット画像)</p>
        </div> */}

        <div className={styles.actionsContainer}>
            <Link to="/analysis_detail" state={{ analysisResult: result }} className="button-secondary">分析詳細を見る</Link>
            <Link to="/image_upload" className="button-primary">別の画像を分析する</Link>
        </div>
        </div>
    );
};

export default AnalysisResultsPage;