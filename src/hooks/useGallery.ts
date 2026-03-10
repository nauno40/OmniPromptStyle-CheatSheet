import { useState, useMemo, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { favoriteService } from '../services/favoriteService';

export const useGallery = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>(() => favoriteService.getFavorites());
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSpecialFilter, setSelectedSpecialFilter] = useState<string | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

    const searchResults = useMemo(() => {
        return dataService.search(searchQuery, favorites, selectedCategory, selectedSpecialFilter);
    }, [searchQuery, favorites, selectedCategory, selectedSpecialFilter]);

    const toggleFavorite = useCallback((id: string) => {
        const newFavorites = favoriteService.toggleFavorite(id);
        setFavorites([...newFavorites]);
    }, []);

    const selectArtist = useCallback((id: string | null) => {
        setSelectedArtist(id);
    }, []);

    const styleCount = useMemo(() => dataService.getArtists().length, []);
    const categories = useMemo(() => dataService.getCategories(), []);

    const similarExcluded = useMemo(() => searchResults.similarExcluded, [searchResults]);
    const similarAvailable = useMemo(() => searchResults.similarAvailable, [searchResults]);

    return {
        searchQuery,
        setSearchQuery,
        favorites,
        toggleFavorite,
        searchResults,
        showFilters,
        setShowFilters,
        selectedCategory,
        setSelectedCategory,
        selectedSpecialFilter,
        setSelectedSpecialFilter,
        styleCount,
        categories,
        similarExcluded,
        similarAvailable,
        selectedArtist,
        selectArtist
    };
};
