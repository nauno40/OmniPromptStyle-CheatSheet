import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import styles from './Header.module.css';
import type { ModelType } from '../../types/artist';
import { dataService, type ModelDefinition } from '../../services/dataService';

interface HeaderProps {
    activeModel: ModelType;
    setActiveModel: (model: ModelType) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    styleCount: number;
}

export const Header: React.FC<HeaderProps> = ({
    activeModel,
    setActiveModel,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    styleCount
}) => {
    const location = useLocation();
    const isGallery = location.pathname === '/';

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                <h1 className={styles.title}>
                    OmniPromptStyle - Cheat Sheets
                </h1>

                <div className={styles.modelSwitcher}>
                    {dataService.getAvailableModels().map((model: ModelDefinition) => (
                        <button
                            key={model.id}
                            className={clsx(styles.modelButton, activeModel === model.id && styles.modelActive)}
                            onClick={() => setActiveModel(model.id)}
                        >
                            {model.name}
                        </button>
                    ))}
                </div>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    <li>
                        <Link
                            to="/"
                            className={clsx(styles.navLink, location.pathname === '/' && !showFilters && styles.navActive)}
                        >
                            Styles
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/metadata"
                            className={clsx(styles.navLink, location.pathname === '/metadata' && styles.navActive)}
                        >
                            Metadata
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/notes"
                            className={clsx(styles.navLink, location.pathname === '/notes' && styles.navActive)}
                        >
                            Notes
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/about"
                            className={clsx(styles.navLink, location.pathname === '/about' && styles.navActive)}
                        >
                            About
                        </Link>
                    </li>
                </ul>

                {isGallery && (
                    <div className={styles.searchArea}>
                        <button
                            className={clsx(styles.filterButton, showFilters && styles.filterActive)}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filter
                        </button>
                        <div className={styles.searchWrapper}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder={`Search ${styleCount} Styles`}
                                value={searchQuery}
                                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                            />
                            {searchQuery && (
                                <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};
