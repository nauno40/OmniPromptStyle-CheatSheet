import { useState, useEffect, useCallback } from 'react';
import { comparisonService } from '../services/comparisonService';
import type { ComparisonItem } from '../types/comparison';

export const useComparison = () => {
    const [items, setItems] = useState<ComparisonItem[]>(() => comparisonService.getItems());

    useEffect(() => {
        return comparisonService.subscribe(() => {
            setItems([...comparisonService.getItems()]);
        });
    }, []);

    const addItem = useCallback((item: ComparisonItem) => {
        comparisonService.addItem(item);
    }, []);

    const removeItem = useCallback((artistId: string) => {
        comparisonService.removeItem(artistId);
    }, []);

    const clear = useCallback(() => {
        comparisonService.clear();
    }, []);

    const isInComparison = useCallback((artistId: string) => {
        return comparisonService.isInComparison(artistId);
    }, []);

    return {
        items,
        addItem,
        removeItem,
        clear,
        isInComparison
    };
};
