import React from 'react';
import { Header } from './Header';
import { useGallery } from '../../hooks/useGallery';
import { ComparisonButton } from '../ui/ComparisonButton';
import { ComparisonDrawer } from '../ui/ComparisonDrawer';
import { useComparison } from '../../hooks/useComparison';

interface LayoutProps {
    children: React.ReactNode | ((props: ReturnType<typeof useGallery>) => React.ReactNode);
    galleryState: ReturnType<typeof useGallery>;
}

export const Layout: React.FC<LayoutProps> = ({ children, galleryState }) => {
    const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);
    const comparison = useComparison();

    return (
        <div className="app-container">
            <Header
                activeModel={galleryState.activeModel}
                setActiveModel={galleryState.setActiveModel}
                activeCheckpoint={galleryState.selectedCheckpoint}
                setActiveCheckpoint={galleryState.setSelectedCheckpoint}
                checkpoints={galleryState.checkpoints}
                searchQuery={galleryState.searchQuery}
                setSearchQuery={galleryState.setSearchQuery}
                showFilters={galleryState.showFilters}
                setShowFilters={galleryState.setShowFilters}
                styleCount={galleryState.styleCount}
            />
            <main>
                {typeof children === 'function' ? children(galleryState) : children}
            </main>

            <ComparisonButton
                count={comparison.items.length}
                onClick={() => setIsComparisonOpen(true)}
            />

            <ComparisonDrawer
                isOpen={isComparisonOpen}
                onClose={() => setIsComparisonOpen(false)}
                items={comparison.items}
                onRemove={comparison.removeItem}
                onClear={comparison.clear}
            />
        </div>
    );
};
