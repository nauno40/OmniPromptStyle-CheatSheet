import React from 'react';
import { StyleCard } from '../ui/StyleCard';
import type { Artist, ExcludedArtist } from '../../types/artist';
import styles from './GalleryGrid.module.css';

interface GalleryGridProps {
    artists: Artist[];
    onSelectArtist: (id: string) => void;
    similarExcluded: (ExcludedArtist & { displayName: string })[];
    similarAvailable: { name: string; status: number }[];
    onSimilarClick: (name: string) => void;
    searchQuery: string;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
    artists,
    onSelectArtist,
    similarExcluded,
    similarAvailable,
    onSimilarClick,
    searchQuery
}) => {
    const hasResults = artists.length > 0;
    const hasSimilar = similarExcluded.length > 0 || similarAvailable.length > 0;

    return (
        <div className={styles.container}>
            {hasResults ? (
                <div className={styles.grid}>
                    {artists.map((artist) => (
                        <StyleCard
                            key={artist.Creation}
                            artist={artist}
                            onClick={() => onSelectArtist(artist.Creation)}
                        />
                    ))}
                </div>
            ) : searchQuery && !hasSimilar && (
                <div className={styles.noResults}>
                    <p>No styles found for "{searchQuery}"</p>
                </div>
            )}

            {searchQuery && hasSimilar && (
                <div className={styles.similarSection}>
                    <span className={styles.similarTitle}>Similar artist names found:</span>
                    <div className={styles.similarList}>
                        {similarAvailable.map((item) => (
                            <span
                                key={item.name}
                                className={styles.similarItem}
                                onClick={() => onSimilarClick(item.name)}
                            >
                                {item.name}
                            </span>
                        ))}
                        {similarExcluded.map((excl) => (
                            <span
                                key={excl.displayName}
                                className={styles.similarItem}
                                onClick={() => alert(`Excluded: ${excl.Extrainfo || 'No reason provided'}`)}
                                title={excl.Extrainfo}
                            >
                                {excl.displayName} (Excluded)
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
