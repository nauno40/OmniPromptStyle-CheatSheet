import React from 'react';
import type { Artist } from '../../types/artist';
import { createAnchor } from '../../utils/stringUtils';
import styles from './StyleCard.module.css';

interface StyleCardProps {
    artist: Artist;
    onClick: () => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({
    artist,
    onClick
}) => {
    const anchor = createAnchor(artist.Name);
    const imageUrl = `/img/${artist.Image}`;

    return (
        <div
            id={anchor}
            className={styles.stylepod}
            style={{ backgroundImage: `url(${imageUrl})` }}
            onClick={onClick}
        >
            <h3 className={styles.cardTitle}>
                {artist.Name}{artist.Death ? '†' : ''}
            </h3>

            <div className={styles.gallery}>
                <figure className={styles.figure} style={{ backgroundImage: `url(${imageUrl})` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url(${imageUrl})` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url(${imageUrl})` }} />
                <figure className={styles.figure} style={{ backgroundImage: `url(${imageUrl})` }} />
            </div>
        </div>
    );
};
