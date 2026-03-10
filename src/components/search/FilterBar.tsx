import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import styles from './FilterBar.module.css';

interface FilterBarProps {
    categories: Record<string, number>;
    onCategorySelect: (category: string | null) => void;
    activeCategory: string | null;
    onSpecialFilterSelect: (filter: string | null) => void;
    activeSpecialFilter: string | null;
    show: boolean;
    onClose: () => void;
}

const SPECIAL_FILTERS = ['Liked', 'New', 'Random', '†'];

export const FilterBar: React.FC<FilterBarProps> = ({
    categories,
    onCategorySelect,
    activeCategory,
    onSpecialFilterSelect,
    activeSpecialFilter,
    show,
    onClose
}) => {
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click was outside the FilterBar
            // And also check if it wasn't on the Filter button (which has a specific class we can check or just let it handle itself)
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                // If it's a click outside, we close. 
                // We add a small delay or check to see if we clicked the toggle button to avoid double toggle
                // Classes of interest: Header_filterButton__...
                const target = event.target as HTMLElement;
                if (!target.closest('[class*="filterButton"]')) {
                    onClose();
                }
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) return null;

    const sortedCategories = Object.keys(categories)
        .filter(cat => categories[cat] >= 5)
        .sort();

    return (
        <div className={clsx(styles.filterBar, show && styles.show)} ref={filterRef}>
            <div id="allcats" className={clsx(styles.tagGrid, show && styles.show)}>
                {SPECIAL_FILTERS.map(filter => (
                    <span
                        key={filter}
                        className={clsx(
                            styles.tag,
                            styles.specialfilters,
                            activeSpecialFilter === filter && styles.active
                        )}
                        onClick={() => onSpecialFilterSelect(activeSpecialFilter === filter ? null : filter)}
                    >
                        {filter}
                    </span>
                ))}

                {sortedCategories.map(category => (
                    <span
                        key={category}
                        className={clsx(
                            styles.tag,
                            activeCategory === category && styles.active
                        )}
                        onClick={() => onCategorySelect(activeCategory === category ? null : category)}
                    >
                        {category}
                        <span className={styles.tagCount}>{categories[category]}</span>
                    </span>
                ))}
            </div>
        </div>
    );
};
