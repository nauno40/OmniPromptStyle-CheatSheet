import React, { useState, useEffect, useRef } from 'react';
import { StyleCard } from '../ui/StyleCard';
import type { Artist } from '../../types/artist';
import styles from './GalleryGrid.module.css';

interface GalleryGridProps {
    artists: Artist[];
    onSelectArtist: (id: string) => void;
    similarExcluded: { displayName: string; Name: string; Code: string; Extrainfo: string }[];
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

    const [visibleCount, setVisibleCount] = useState(40);
    const observerTarget = useRef<HTMLDivElement>(null);

    const [prevArtists, setPrevArtists] = useState(artists);
    if (artists !== prevArtists) {
        setPrevArtists(artists);
        setVisibleCount(40);
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => Math.min(prev + 40, artists.length));
                }
            },
            { threshold: 0.1, rootMargin: '400px' } // Load slightly before reaching the bottom
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [artists.length]);

    const visibleArtists = artists.slice(0, visibleCount);

    return (
        <div className={styles.container}>
            {hasResults ? (
                <>
                    <div className={styles.grid}>
                        {visibleArtists.map((artist) => (
                            <StyleCard
                                key={artist.Creation}
                                artist={artist}
                                onClick={() => onSelectArtist(artist.Creation)}
                            />
                        ))}
                    </div>
                    {/* Invisible sentinel for intersection observer */}
                    {visibleCount < artists.length && (
                        <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
                    )}
                </>
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
