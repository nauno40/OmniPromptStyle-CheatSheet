import React from 'react';
import { Layers } from 'lucide-react';
import styles from './ComparisonButton.module.css';

interface ComparisonButtonProps {
    count: number;
    onClick: () => void;
}

export const ComparisonButton: React.FC<ComparisonButtonProps> = ({ count, onClick }) => {
    if (count === 0) return null;

    return (
        <button className={styles.fab} onClick={onClick} title="Compare Styles">
            <Layers size={24} />
            <span className={styles.badge}>{count}</span>
        </button>
    );
};
