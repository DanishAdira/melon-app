import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoadingPage.module.css';

const LoadingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/image_upload", { replace: true });
    }, [navigate]);

    return (
        <div className={styles.loadingContainer}>
            <h1>読み込み中...</h1>
            <p>ページを準備しています</p>
            <div className={styles.spinner} />
        </div>
    );
};

export default LoadingPage;