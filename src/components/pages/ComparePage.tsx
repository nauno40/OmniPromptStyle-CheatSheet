import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useComparison } from '../../hooks/useComparison';
import { dataService } from '../../services/dataService';
import { resolveImagePath } from '../../utils/imageUtils';
import { clsx } from 'clsx';
import styles from './ComparePage.module.css';

export const ComparePage: React.FC = () => {
    const { items, addItem, removeItem, clear } = useComparison();
    const [copyKey, setCopyKey] = useState<string | null>(null);

    const handleCopy = (prompt: string, id: string) => {
        navigator.clipboard.writeText(prompt);
        setCopyKey(id);
        setTimeout(() => setCopyKey(null), 2000);
    };

    const toggleVersion = (artist: any, modelId: string, checkpointId: string | null) => {
        const compareId = `${artist.Creation}-${modelId}-${checkpointId || 'none'}`;
        const inComp = items.find(i => i.id === compareId);
        
        if (inComp) {
            removeItem(compareId);
        } else {
            addItem({
                id: compareId,
                artistId: artist.Creation,
                modelId: modelId,
                checkpointId: checkpointId,
                artistName: artist.Name,
                category: artist.Category,
                image: artist.Image,
                prompt: artist.Prompt
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h2>No styles to compare</h2>
                    <p>Go back to the gallery and add some styles to your comparison list.</p>
                    <Link to="/" className={styles.backLink}>
                        <ArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                        Back to Styles
                    </Link>
                </div>
            </div>
        );
    }

    // Group items by artist name
    const groupedItemsByArtist = items.reduce((acc, item) => {
        if (!acc[item.artistName]) {
            acc[item.artistName] = [];
        }
        acc[item.artistName].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Comparison</h1>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/" className={styles.backLink}>Back to Styles</Link>
                    <button onClick={clear} className={styles.actionBtn + ' ' + styles.btnRed}>
                        Clear Board
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {Object.entries(groupedItemsByArtist).map(([artistName, compareItems]) => {
                    const firstItem = compareItems[0];
                    const baseArtist = dataService.getArtistById(firstItem.artistId);
                    const allAvailableVersions = baseArtist ? dataService.getArtistVersions(baseArtist) : [];
                    
                    const versionsWithMeta = allAvailableVersions.map(v => {
                        const compareId = `${v.Creation}-${v.Model}-${v.Checkpoint || 'none'}`;
                        const inCompItem = items.find(i => i.id === compareId);
                        return {
                            ...v,
                            compareId,
                            inComparison: !!inCompItem
                        };
                    });

                    // We only display what's in the comparison list on the right now
                    const displayedVersions = versionsWithMeta.filter(v => v.inComparison);

                    return (
                        <div key={artistName} className={styles.styleGroup}>
                            <div className={styles.infoSection}>
                                <h2 className={styles.rowTitle}>{artistName}</h2>
                                
                                <div className={styles.tagContainer}>
                                    {(baseArtist?.Category || '').split(',').map(cat => (
                                        <span key={cat.trim()} className={styles.tag}>{cat.trim()}</span>
                                    ))}
                                </div>

                                <span className={styles.promptLabel}>Prompt</span>
                                <div 
                                    className={styles.promptBox} 
                                    onClick={() => handleCopy(baseArtist?.Prompt || '', artistName)}
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                >
                                    {baseArtist?.Prompt}
                                    {copyKey === artistName && (
                                        <span className={styles.copyFeedback}>Copied!</span>
                                    )}
                                </div>

                                <div className={styles.versionToggleList}>
                                    <span className={styles.promptLabel}>Versions / Models</span>
                                    {versionsWithMeta.map(v => (
                                        <div 
                                            key={v.compareId} 
                                            className={clsx(styles.versionToggleItem, v.inComparison && styles.versionToggleActive)}
                                            onClick={() => toggleVersion(v, v.Model, v.Checkpoint || null)}
                                        >
                                            <div className={styles.versionToggleLabel}>
                                                <span className={styles.versionModelName}>{v.Model}</span>
                                                {v.Checkpoint && <span className={styles.versionCheckpointName}>{v.Checkpoint}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.versionList}>
                                {displayedVersions.map((v) => {
                                    const imageUrl = resolveImagePath(v as any);
                                    return (
                                        <div key={v.compareId} className={styles.versionImageStrip}>
                                            <div className={styles.overlayLabel}>
                                                <span className={styles.tag + ' ' + styles.tagBlue}>{v.Model}</span>
                                                {v.Checkpoint && <span className={styles.tag + ' ' + styles.tagBlue}>{v.Checkpoint}</span>}
                                            </div>
                                            
                                            <div className={styles.imageFilmstrip}>
                                                <div
                                                    className={styles.quadrant}
                                                    style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: '0 0' }}
                                                />
                                                <div
                                                    className={styles.quadrant}
                                                    style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: '100% 0' }}
                                                />
                                                <div
                                                    className={styles.quadrant}
                                                    style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: '0 100%' }}
                                                />
                                                <div
                                                    className={styles.quadrant}
                                                    style={{ backgroundImage: `url("${imageUrl}")`, backgroundPosition: '100% 100%' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
