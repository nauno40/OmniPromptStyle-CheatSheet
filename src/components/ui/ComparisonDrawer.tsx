import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Copy, ExternalLink, GitCompare } from 'lucide-react';
import type { ComparisonItem } from '../../types/comparison';
import { clsx } from 'clsx';
import styles from './ComparisonDrawer.module.css';

interface ComparisonDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    items: ComparisonItem[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
    isOpen,
    onClose,
    items,
    onRemove,
    onClear
}) => {
    const navigate = useNavigate();
    const [copyKey, setCopyKey] = useState<string | null>(null);

    const handleCopy = (prompt: string, id: string) => {
        navigator.clipboard.writeText(prompt);
        setCopyKey(id);
        setTimeout(() => setCopyKey(null), 2000);
    };

    const handleFullView = () => {
        onClose();
        navigate('/compare');
    };

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <div className={clsx(styles.drawer, isOpen && styles.drawerOpen)}>
                <div className={styles.header}>
                    <h2>Comparison ({items.length})</h2>
                    <X className={styles.closeBtn} onClick={onClose} size={24} />
                </div>

                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No styles added to comparison yet.</p>
                            <p>Click the compare icon on any style card to add it here.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    <div
                                        className={styles.thumbnail}
                                        style={{ backgroundImage: `url("${item.image}")` }}
                                    />
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>{item.artistName}</div>
                                        <div className={styles.itemMeta}>
                                            {item.modelId} {item.checkpointId && `• ${item.checkpointId}`}
                                        </div>
                                    </div>
                                    <Trash2
                                        className={styles.removeItem}
                                        size={18}
                                        onClick={() => onRemove(item.id)}
                                    />
                                </div>
                                <div
                                    className={styles.promptArea}
                                    onClick={() => handleCopy(item.prompt, item.id)}
                                >
                                    {item.prompt}
                                    <span className={styles.copyLabel}>
                                        <Copy size={12} /> Copy
                                    </span>
                                    {copyKey === item.id && (
                                        <span className={styles.copyFeedback}>Copied!</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <button className={styles.fullViewBtn} onClick={handleFullView}>
                            <GitCompare size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            View Full Comparison
                        </button>
                        <button className={styles.clearBtn} onClick={onClear}>
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
