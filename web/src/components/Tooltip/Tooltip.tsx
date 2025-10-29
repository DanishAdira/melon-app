import React, { useState } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={styles.tooltipContainer}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {isHovered && (
                <div className={styles.tooltipBox}>
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;