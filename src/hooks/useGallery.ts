import { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { dataService } from '../services/dataService';
import { favoriteService } from '../services/favoriteService';
import type { ModelType } from '../types/artist';

export const useGallery = () => {
    const [activeModel, setActiveModelState] = useState<ModelType>(() => dataService.getActiveModel());
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [favorites, setFavorites] = useState<string[]>(() => favoriteService.getFavorites());
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);
    const [selectedSpecialFilter, setSelectedSpecialFilter] = useState<string | null>(null);
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

    const setActiveModel = useCallback((model: ModelType) => {
        dataService.setActiveModel(model);
        setActiveModelState(model);
        // Reset category, checkpoint and special filter when switching models
        setSelectedCategory(null);
        setSelectedCheckpoint(null);
        setSelectedSpecialFilter(null);
    }, []);

    const searchResults = useMemo(() => {
        return dataService.search(deferredSearchQuery, favorites, selectedCategory, selectedSpecialFilter, selectedCheckpoint);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deferredSearchQuery, favorites, selectedCategory, selectedSpecialFilter, selectedCheckpoint, activeModel]);

    const toggleFavorite = useCallback((id: string) => {
        const newFavorites = favoriteService.toggleFavorite(id);
        setFavorites([...newFavorites]);
    }, []);

    const selectArtist = useCallback((id: string | null) => {
        setSelectedArtist(id);
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const styleCount = useMemo(() => dataService.getArtists().length, [activeModel, selectedCheckpoint]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const categories = useMemo(() => dataService.getCategories(), [activeModel]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkpoints = useMemo(() => dataService.getCheckpoints(), [activeModel]);

    const similarExcluded = useMemo(() => searchResults.similarExcluded, [searchResults]);
    const similarAvailable = useMemo(() => searchResults.similarAvailable, [searchResults]);

    return {
        activeModel,
        setActiveModel,
        searchQuery,
        setSearchQuery,
        favorites,
        toggleFavorite,
        searchResults,
        showFilters,
        setShowFilters,
        selectedCategory,
        setSelectedCategory,
        selectedCheckpoint,
        setSelectedCheckpoint,
        selectedSpecialFilter,
        setSelectedSpecialFilter,
        styleCount,
        categories,
        checkpoints,
        similarExcluded,
        similarAvailable,
        selectedArtist,
        selectArtist
    };
};
