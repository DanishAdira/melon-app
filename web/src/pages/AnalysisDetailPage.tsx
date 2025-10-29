import React from "react";
import { useLocation, Link } from "react-router-dom";
import styles from "./AnalysisResultsPage.module.css";

const AnalysisDetailPage = () => {
    const location = useLocation();
    const result = location.state?.analysisResult;

    if (!result) {
        return (
            <div className={styles.pageContainer}>
                <h1>分析詳細</h1>
                <p>分析結果データが見つかりませんでした．画像アップロードページからやり直してください．</p>
                <div className={styles.actionsContainer}>
                    <Link to="/image_upload" className="button-primary">画像アップロードページへ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <h1>分析詳細</h1>

            <div className={styles.resultHeader}>
                <p><strong>ファイル名:</strong> {result.fileName || 'N/A'}</p>
                <p><strong>分析ID:</strong> {result.id || 'N/A'}</p>
                {result.summary && <p><strong>サマリー:</strong> {result.summary}</p>}
            </div>

            <div className={styles.imageSection}>
                <h3>検出結果プロット画像</h3>
                {result.detectionImageUrl ? (
                    <img
                        src={result.detectionImageUrl}
                        alt="検出結果プロット画像"
                        className={styles.resultImage}
                    />
                ) : (
                    <p>検出結果プロット画像はありません。</p>
                )}
                <p className={styles.imageCaption}>(検出したメロンの中心領域をプロットした画像)</p>
            </div>

            <div className={styles.imageSection}>
                <h3>網目推定（セグメント化された画像）</h3>
                {result.estimatedMeshImageUrl ? (
                    <img
                        src={result.estimatedMeshImageUrl}
                        alt="網目推定"
                        className={styles.resultImage}
                    />
                ) : (
                    <p>網目推定画像はありません。</p>
                )}
                <p className={styles.imageCaption}>(シミュレーション画像)</p>
            </div>

            {/* <div className={styles.imageSection}> }
                <h3>形状解析画像</h3>
                {result.contourImageUrl ? (
                    <img
                        src={result.contourImageUrl}
                        alt="輪郭検出画像"
                        className={styles.resultImage}
                    />
                ) : (
                    <p>輪郭検出画像はありません。</p>
                )}
                <p className={styles.imageCaption}>(楕円フィッティングに基づく真円度)</p>
            </div*/}

            <div className={styles.imageSection}>
                <h3>分岐点プロット画像</h3>
                {result.branchVisImageUrl ? (
                    <img
                        src={result.branchVisImageUrl}
                        alt="分岐点プロット画像"
                        className={styles.resultImage}
                    />
                ) : (
                    <p>分岐点プロット画像はありません。</p>
                )}
                <p className={styles.imageCaption}>(分岐点の位置のプロット画像)</p>
            </div>

            <div className={styles.actionsContainer}>
                <Link to="/analysis_results" state={{ analysisResult: result }} className="button-secondary">分析サマリーへ戻る</Link>
                <Link to="/image_upload" className="button-primary">別の画像を分析する</Link>
            </div>
        </div>
    );
};

export default AnalysisDetailPage;