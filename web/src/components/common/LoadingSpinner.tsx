import React from 'react';

interface LoadingSpinnerProps {
message?: string;
className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
message = "読み込み中...",
className,
}) => {
return (
    <div className={className}>
    <p>{message}</p>
    </div>
);
};

export default LoadingSpinner;