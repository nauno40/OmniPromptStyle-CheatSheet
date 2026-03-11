import React, { useState } from 'react';
import { Maximize2, Search as SearchIcon, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Artist } from '../../types/artist';
import { resolveImagePath } from '../../utils/imageUtils';
import { clsx } from 'clsx';
import styles from './ArtistModal.module.css';

interface ArtistModalProps {
    artist: Artist;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

const CAROUSEL_SLIDES = [
    { name: 'Grid', size: '100% 100%', pos: '0 0' },
    { name: 'Top Left', size: '200% 200%', pos: '0 0' },
    { name: 'Top Right', size: '200% 200%', pos: '100% 0' },
    { name: 'Bottom Left', size: '200% 200%', pos: '0 100%' },
    { name: 'Bottom Right', size: '200% 200%', pos: '100% 100%' },
];

export const ArtistModal: React.FC<ArtistModalProps> = ({
    artist,
    isFavorite,
    onToggleFavorite
}) => {
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const imageUrl = resolveImagePath(artist);
    const artistLookupUrl = `https://www.google.com/search?q=${encodeURIComponent(artist.Name)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(artist.Prompt);
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 2000);
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    };

    const activeSlide = CAROUSEL_SLIDES[currentSlide];

    return (
        <>
            <div className={styles.container}>
                <div className={styles.infoSide}>
                    <h2 className={styles.artistName}>
                        {artist.Name}{artist.Death ? '†' : ''}
                    </h2>

                    <div className={styles.track}>
                        {artist.Checkpoint && (
                            <span className={clsx(styles.tag, styles.checkpointTag)}>
                                {artist.Checkpoint}
                            </span>
                        )}
                        {artist.Category.split(',').map((cat, i) => (
                            <span key={i} className={styles.tag}>{cat.trim()}</span>
                        ))}
                    </div>

                    <div className={styles.promptSection}>
                        <label className={styles.promptLabel} onClick={handleCopy}>
                            COPY PROMPT
                        </label>
                        <div className={styles.promptBox} onClick={handleCopy}>
                            {artist.Prompt}
                            {showCopyFeedback && <span className={styles.copyFeedback}>Copied!</span>}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => setIsZoomed(true)}>
                            <Maximize2 size={16} />
                            <span>Zoom</span>
                        </button>
                        <a
                            href={artistLookupUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.actionBtn}
                        >
                            <SearchIcon size={16} />
                            <span>Look Up</span>
                        </a>
                        <button
                            className={clsx(styles.actionBtn, isFavorite && styles.favoriteActive)}
                            onClick={() => onToggleFavorite(artist.Creation)}
                        >
                            <Heart size={16} fill={isFavorite ? "white" : "none"} />
                        </button>
                    </div>
                </div>

                <div
                    className={styles.gallerySide}
                    style={{
                        backgroundImage: `url("${imageUrl}")`,
                        backgroundSize: activeSlide.size,
                        backgroundPosition: activeSlide.pos
                    }}
                    onClick={() => setIsZoomed(true)}
                >
                    <button className={clsx(styles.navBtn, styles.left)} onClick={prevSlide}>
                        <ChevronLeft size={32} />
                    </button>
                    <button className={clsx(styles.navBtn, styles.right)} onClick={nextSlide}>
                        <ChevronRight size={32} />
                    </button>

                    <div className={styles.dotContainer}>
                        {CAROUSEL_SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={clsx(styles.dot, currentSlide === i && styles.activeDot)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentSlide(i);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isZoomed && (
                <div className={styles.zoomOverlay} onClick={() => setIsZoomed(false)}>
                    <div
                        className={styles.zoomedImageContainer}
                        style={{
                            backgroundImage: `url("${imageUrl}")`,
                            backgroundSize: activeSlide.size,
                            backgroundPosition: activeSlide.pos
                        }}
                    />
                </div>
            )}
        </>
    );
};
