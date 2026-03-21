import React from 'react';
import { GitCompare, Check } from 'lucide-react';
import type { Artist } from '../../types/artist';
import { createAnchor } from '../../utils/stringUtils';
import { resolveImagePath } from '../../utils/imageUtils';
import { useComparison } from '../../hooks/useComparison';
import { dataService } from '../../services/dataService';
import { generatePromptFromName } from '../../utils/stringUtils';
import { clsx } from 'clsx';
import styles from './StyleCard.module.css';

interface StyleCardProps {
    artist: Artist;
    onClick: () => void;
}

export const StyleCard: React.FC<StyleCardProps> = React.memo(({
    artist,
    onClick
}) => {
    const anchor = createAnchor(artist.Name);
    const imageUrl = resolveImagePath(artist);
    const { items, addItem, removeItem } = useComparison();
    
    // Check if ANY version of this artist is in comparison
    const isCompared = items.some(i => i.artistId === artist.Creation);

    const toggleComparison = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Get ALL versions of this artist
        const allVersions = dataService.getArtistVersions(artist);
        
        if (isCompared) {
            // Remove ALL versions currently in comparison for this artist
            const versionsToRemove = items.filter(i => i.artistId === artist.Creation);
            versionsToRemove.forEach(v => removeItem(v.id));
        } else {
            // Add ALL available versions
            allVersions.forEach(v => {
                const compareId = `${v.Creation}-${v.Model}-${v.Checkpoint || 'none'}`;
                addItem({
                    id: compareId,
                    artistId: v.Creation,
                    artistName: v.Name,
                    category: v.Category,
                    image: v.Image,
                    prompt: generatePromptFromName(v.Name),
                    modelId: v.Model,
                    checkpointId: v.Checkpoint || null
                });
            });
        }
    };

    return (
        <div
            id={anchor}
            className={styles.stylepod}
            onClick={onClick}
        >
            <img 
                src={imageUrl} 
                alt={artist.Name} 
                loading="lazy" 
                className={styles.cardImage} 
            />
            <h3 className={styles.cardTitle}>
                {artist.Name}{artist.Death ? '†' : ''}
            </h3>

            <button
                className={clsx(styles.comparisonToggle, isCompared && styles.comparisonActive)}
                onClick={toggleComparison}
                title={isCompared ? "Remove from comparison" : "Add for comparison"}
            >
                {isCompared ? <Check size={20} /> : <GitCompare size={20} />}
            </button>

            <div className={styles.gallery}>
                <figure className={styles.figure} style={{ backgroundImage: `url("${imageUrl}")` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url("${imageUrl}")` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url("${imageUrl}")` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url("${imageUrl}")` }} />
            </div>
        </div>
    );
});
