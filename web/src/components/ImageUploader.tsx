import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ImageUploader.module.css';
import Button from './common/Button';

interface ImageUploaderProps {
onFileSelect: (file: File | null) => void;
disabled?: boolean;
initialPreviewUrl?: string | null;
resetKey?: string | number;
className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
onFileSelect,
disabled = false,
initialPreviewUrl = null,
resetKey,
className,
}) => {
const [internalPreviewUrl, setInternalPreviewUrl] = useState<string | null>(initialPreviewUrl);
const [isDragOver, setIsDragOver] = useState<boolean>(false);
const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
    const objectUrlToRevoke = internalPreviewUrl;
    return () => {
    if (objectUrlToRevoke && objectUrlToRevoke.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrlToRevoke);
    }
    };
}, [internalPreviewUrl]);

useEffect(() => {
    setInternalPreviewUrl(initialPreviewUrl);
    if (resetKey !== undefined) {
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    onFileSelect(null);
    }
}, [initialPreviewUrl, resetKey, onFileSelect]);


const handleFileProcessing = useCallback((file: File | null) => {
    if (file && file.type.startsWith('image/')) {
    const newObjectUrl = URL.createObjectURL(file);
    setInternalPreviewUrl(newObjectUrl);
    onFileSelect(file);
    } else {
    setInternalPreviewUrl(initialPreviewUrl);
    onFileSelect(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    if (file) {
        alert('画像ファイル形式が無効です．PNG, JPG, GIFなどの画像ファイルを選択してください．');
    }
    }
}, [onFileSelect, initialPreviewUrl]);

const handleFileChangeFromInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileProcessing(file);
};

const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
    setIsDragOver(true);
    }
};

const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget;
    if (!dropZone.contains(event.relatedTarget as Node)) {
    setIsDragOver(false);
    }
};

const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
    setIsDragOver(true);
    }
};

const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] || null;
    handleFileProcessing(file);
};

const handleZoneClick = () => {
    if (disabled || !fileInputRef.current) return;
    fileInputRef.current.click();
};

const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setInternalPreviewUrl(initialPreviewUrl);
    if (fileInputRef.current) {
    fileInputRef.current.value = '';
    }
    onFileSelect(null);
};

const dropZoneClasses = `
    ${styles.dropZone}
    ${isDragOver && !disabled ? styles.isDragOver : ''}
    ${disabled ? styles.dropZoneDisabled : ''}
    ${className || ''}
`.trim();

const renderDropZoneContent = () => {
    if (isDragOver && !disabled) {
    return <p className={`${styles.dropZoneText} ${styles.dropZoneTextDragOver || ''}`}>ファイルをアップロード</p>;
    }
    if (internalPreviewUrl && !disabled) {
    return (
        <div className={styles.previewContainer}>
        <img
            src={internalPreviewUrl}
            alt="選択された画像プレビュー"
            className={styles.previewImage}
        />
        <Button
            type="button"
            onClick={handleRemoveImage}
            className={`button-secondary ${styles.removeButton || ''}`}
        >
            画像を削除
        </Button>
        </div>
    );
    }
    return (
    <p className={disabled ? styles.loadingText : styles.dropZoneText}>
        {disabled ? "処理中..." : "画像をドラッグ＆ドロップ\nまたはクリックしてファイルを選択"}
    </p>
    );
};

return (
    <div
    className={dropZoneClasses}
    onDragEnter={handleDragEnter}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    onClick={handleZoneClick}
    role="button"
    tabIndex={disabled ? -1 : 0}
    onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) handleZoneClick(); }}
    >
    <input
        type="file"
        accept="image/*"
        onChange={handleFileChangeFromInput}
        ref={fileInputRef}
        style={{ display: 'none' }}
        disabled={disabled}
    />
    {renderDropZoneContent()}
    </div>
);
};

export default ImageUploader;